/**
 * Fields in a request to update send an email about TODO completion.
 */
export interface EmailNotificationRequest {
  todoName: string
  email: string
}