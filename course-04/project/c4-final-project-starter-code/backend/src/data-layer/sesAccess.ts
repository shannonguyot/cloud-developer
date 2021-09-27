import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class SesAccess {

  constructor(
    private readonly ses = new XAWS.SES({ region: process.env.AWS_REGION })) {
  }

  async verifyEmailAddress(email: string) : Promise<boolean> {
    let success: boolean = false
    const params = {
      EmailAddress: email
    };

    await this.ses.verifyEmailIdentity(params, (err) => {
      if(!err) {
        success = true
      }
    }).promise()

    return success
  }

  async sendEmail(destinationEmail: string, message: string, subject: string) : Promise<boolean> {
    let success: boolean = false
    const params = {
      Destination: {
        ToAddresses: [destinationEmail],
      },
      Message: {
        Body: {
          Text: { Data: message },
        }, 
        Subject: { Data: subject },
      },
      Source: process.env.SOURCE_EMAIL,
    };
  
    await this.ses.sendEmail(params, (err) => {
      if (err) {
        success = true
      }
    }).promise()

    return success
  }
}
