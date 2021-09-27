import { SesAccess } from '../data-layer/sesAccess'

const sesAccess = new SesAccess()

export async function verifyEmailAddress(email: string) : Promise<boolean> {
  return await sesAccess.verifyEmailAddress(email)
}

export async function sendEmail(destinationEmail: string, message: string, subject: string) : Promise<boolean> {
  return await sesAccess.sendEmail(destinationEmail, message, subject)
}
