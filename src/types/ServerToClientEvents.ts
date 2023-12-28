import { DefaultEventsMap } from 'socket.io/dist/typed-events'

export interface ServerToClientEvents extends DefaultEventsMap {
  users_fetched: (users: Record<string, any>[]) => void
  user_connected: (user: Record<string, any>) => void
  user_disconnected: (disconnectedUserId: string) => void
  private_message_sent: (message: Record<string, any>) => void
  private_messages_fetched: (
    userId: string,
    messages: Record<string, any>[]
  ) => void
}
