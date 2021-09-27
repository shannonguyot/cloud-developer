import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class SnsAccess {

  constructor(
    private readonly sns = new XAWS.SNS()) {
  }

  async publishMessage(message: string) : Promise<boolean> {
    let success : boolean = false

    await this.sns.publish({
      TopicArn: process.env.TOPIC_ARN,
      Message: message
    }, function(err) {
      if(!err) {
        success = true
      }
    }).promise()

    return success
  }
}
