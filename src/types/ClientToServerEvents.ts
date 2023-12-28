import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { IMessage } from '@/types/index'

export interface ClientToServerEvents extends DefaultEventsMap {
  send_private_message: (
    message: Pick<IMessage, 'body' | 'clientOffset'> & { to: string },
    callback: () => void
  ) => void
  fetch_private_messages: (userId: string, callback: () => void) => void
}
