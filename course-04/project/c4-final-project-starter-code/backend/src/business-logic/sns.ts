import { SnsAccess } from '../data-layer/snsAccess'

const snsAccess = new SnsAccess()

export async function publishMessage(message: string) : Promise<boolean> {
  return await snsAccess.publishMessage(message)
}
