import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { userExists } from '../../business-logic/users'
import { queryByUserId } from '../../business-logic/todos'
import { User } from '../../models/UserItem'
import { createLogger } from '../../utils/logger'

const logger = createLogger('get-remaining-todo-count')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Caller event', event)

  logger.info('Checking for user...')
  let user: User

  try {
    user = await userExists(event.headers.Authorization)
  } catch(e) {
    logger.error('Error when checking token for user ID.', { error: e.message })
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'Malformed token received'
      })
    }
  }

  if (!user) {
    logger.info('User does not exist yet, so no todos can be checked;' +
      'user will be officially created when the first todo is added.')
    return {
      statusCode: 201,
      body: JSON.stringify({
        activeTodoCount: 0
      })
    }
  }

  logger.info(`Fetching todos by user id of ${user.id}...`)
  const items = await queryByUserId(user.id)
  logger.info('Fetch operation complete; checking completion status of todos...')

  let activeTodoCount = 0;

  items.forEach(todoItem => {
    if(typeof todoItem.done != "boolean"){
      logger.info('Unable to retrieve the completion status for a todo; todo does not match expected format.')
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Malformed todos retrieved.'
        })
      }
    }
    if(!todoItem.done) {
      activeTodoCount++;
    }
  });

  logger.info('Fetch operation complete; todo remaining count will be sent in response.')
  return {
    statusCode: 201,
    body: JSON.stringify({
      activeTodoCount
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
