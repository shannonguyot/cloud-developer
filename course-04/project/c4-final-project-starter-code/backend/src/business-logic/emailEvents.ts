import { EmailEvent } from '../models/EmailEventItem'
import { EmailEventsAccess } from '../data-layer/emailEventsAccess'

const eventsAccess = new EmailEventsAccess()

export async function eventExists(eventId: string): Promise<boolean> {
  return await eventsAccess.eventExists(eventId)
}

export async function createEvent(eventId: string): Promise<boolean> {
  const eventExists = await eventsAccess.eventExists(eventId)

  if(eventExists) {
    return true
  }

  const secondsSinceEpoch: number = Math.round(Date.now() / 1000)
  const expInSeconds: number = parseInt(process.env.EVENT_EXP)
  const event: EmailEvent = {id: eventId, removalTime: secondsSinceEpoch + expInSeconds}

  const result: EmailEvent = await eventsAccess.createEvent(event)

  return result != undefined
}
