import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { userExists } from '../../business-logic/users'
import { publishMessage } from '../../business-logic/sns'
import { User } from '../../models/UserItem'
import { EmailNotificationRequest } from '../../requests/EmailNotificationRequest'
import { createLogger } from '../../utils/logger'

const logger = createLogger('email-request')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Caller event', event)
  logger.info('Checking for user ...')
  let user: User

  try {
    user = await userExists(event.headers.Authorization)
  } catch(e) {
    logger.error('Error when checking token for user ID', { error: e.message })
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'Malformed token received'
      })
    }
  }

  if (!user) {
    logger.info('User does not exist')
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'User does not exist'
      })
    }
  }

  const message: EmailNotificationRequest = JSON.parse(event.body)

  logger.info('Message: ', JSON.stringify(message))

  const result : boolean = await publishMessage(JSON.stringify(message))

  if(!result) {
    logger.error('Error publishing to SNS')
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Unable to publish message to SNS'
      })
    }
  }

  logger.info('SNS publish succeeded: ', JSON.stringify(message))
  return {
    statusCode: 200,
     body: ``
  }
})

handler.use(
  cors({
    credentials: true
  })
)
