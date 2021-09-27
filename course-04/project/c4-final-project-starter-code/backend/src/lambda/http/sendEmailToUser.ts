import 'source-map-support/register'
import { SNSEvent, SNSHandler } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { EmailNotificationRequest } from '../../requests/EmailNotificationRequest'
import { sendEmail } from '../../business-logic/ses';
import { eventExists, createEvent } from '../../business-logic/emailEvents';

const logger = createLogger('email-notification')

export const handler: SNSHandler = async (event: SNSEvent): Promise<void> => {

  logger.info('Processing SNS event ', JSON.stringify(event))

  if(event.Records.length == 0) {
    logger.error('No SNS records provided')
    return
  }

  const record = event.Records[0].Sns.Message
  const messageId: string = 'SendEmail' + event.Records[0].Sns.MessageId

  if(record == undefined || record == '' || messageId == undefined || messageId == '') {
    logger.error('Unable to parse the SNS message and/or message ID: ' + JSON.stringify(record) + ", " + JSON.stringify(messageId))
    return
  }

  logger.info('Processing notification for: ', JSON.stringify(record))

  const request: EmailNotificationRequest = JSON.parse(record)

  const alreadySent: boolean = await eventExists(messageId)

  if(!alreadySent) {
    await createEvent(messageId)
    logger.info('Email event saved to DB: ', messageId)
    const result: boolean = await sendEmail(request.email, "The '" + request.todoName + "' todo has been completed!", "Todo completed")
    if (result) {
      logger.info('Email sent successfully')
    } else {
      logger.error('Email could not be sent to the user')
    }
  }
  else {
    logger.info('The email has already been sent; this is a duplicate invocation')
  }
}
