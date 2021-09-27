import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { EmailEvent } from '../models/EmailEventItem'

const XAWS = AWSXRay.captureAWS(AWS)

export class EmailEventsAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly emailEventsTable = process.env.EMAIL_EVENTS_TABLE) {
  }

  async eventExists(eventId: string): Promise<boolean> {
    const result = await this.docClient
      .query({
        TableName: this.emailEventsTable,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': eventId
        },
        ScanIndexForward: false
      })
      .promise()
  
    return result.Items != undefined && result.Items.length == 1
  }

  async createEvent(emailEvent: EmailEvent): Promise<EmailEvent> {
    await this.docClient.put({
        TableName: this.emailEventsTable,
        Item: emailEvent
      }).promise()

    return emailEvent
  }
}
