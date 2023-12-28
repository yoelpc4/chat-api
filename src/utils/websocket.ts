import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { verify } from 'jsonwebtoken'
import helmet from 'helmet'
import hpp from 'hpp'
import { parse } from 'cookie'
import cookieParser from 'cookie-parser'
import { instanceToPlain } from 'class-transformer'
import csrfValidation from '@/middlewares/csrfValidation'
import {
  connectUser,
  disconnectUser,
  findUser,
  getUsers,
  getUsersByIds,
} from '@/services/userService'
import {
  getReceiverPendingPrivateMessages,
  getPrivateMessages,
  createMessage,
  isMessageExistsWithClientOffset,
} from '@/services/messageService'
import MessageResource from '@/resources/MessageResource'
import UserResource from '@/resources/UserResource'
import UnauthorizedException from '@/exceptions/UnauthorizedException'
import NotFoundException from '@/exceptions/NotFoundException'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@/types'

export const connect = (server: HttpServer) => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    connectionStateRecovery: {},
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      allowedHeaders: ['x-csrf-token'],
      credentials: true,
    },
    path: process.env.WEBSOCKET_PATH,
  })

  io.engine.use(helmet())

  io.engine.use(cookieParser())

  io.engine.use(hpp())

  io.engine.use(csrfValidation)

  io.use(async (socket, next) => {
    const cookies = parse(
      socket.handshake.headers.cookie ?? socket.request.headers.cookie ?? ''
    )

    const accessToken = cookies[process.env.JWT_ACCESS_TOKEN_COOKIE_NAME!]

    try {
      if (accessToken) {
        const { sub } = verify(
          accessToken,
          process.env.JWT_ACCESS_TOKEN_SECRET!,
          {
            issuer: process.env.JWT_ISSUER,
          }
        )

        if (!sub) {
          return next(new UnauthorizedException())
        }

        const user = await findUser(sub.toString())

        if (user) {
          socket.data.user = user

          return next()
        }
      }

      next(new UnauthorizedException())
    } catch (error) {
      console.error(error)

      next(new UnauthorizedException())
    }
  })

  io.on('connection', async (socket) => {
    socket.on('disconnect', async () => {
      const sockets = await io
        .of(socket.data.user._id.toString())
        .fetchSockets()

      if (!sockets) {
        return
      }

      // update session with connection status as disconnected
      await disconnectUser(socket.data.user)

      // notify other users about auth user disconnection
      socket.broadcast.emit(
        'user_disconnected',
        socket.data.user._id.toString()
      )
    })

    socket.on(
      'send_private_message',
      async ({ to, body, clientOffset }, callback) => {
        const isExists = await isMessageExistsWithClientOffset(clientOffset)

        if (isExists) {
          // message already exists, skip processing it
          callback()

          return
        }

        const users = await getUsersByIds(socket.data.user._id.toString(), to)

        const sender = users.find((user) =>
          user._id.equals(socket.data.user._id)
        )

        if (!sender) {
          throw new NotFoundException('Sender not found')
        }

        const receiver = users.find((user) => user._id.equals(to))

        if (!receiver) {
          throw new NotFoundException('Receiver not found')
        }

        const message = await createMessage(
          sender._id.toString(),
          receiver._id.toString(),
          body,
          clientOffset
        )

        // forward private message to receiver
        socket
          .to(receiver._id.toString())
          .emit(
            'private_message_sent',
            instanceToPlain(new MessageResource(message.toJSON()))
          )

        // forward private message to sender
        socket.emit(
          'private_message_sent',
          instanceToPlain(new MessageResource(message.toJSON()))
        )

        callback()
      }
    )

    socket.on('fetch_private_messages', async (userId, callback) => {
      const messages = await getPrivateMessages(
        socket.data.user._id.toString(),
        userId
      )

      socket.emit(
        'private_messages_fetched',
        userId,
        messages.map((message) =>
          instanceToPlain(new MessageResource(message.toJSON()))
        )
      )

      callback()
    })

    // update auth user with connection status as connected
    await connectUser(socket.data.user)

    // join to the auth user room
    socket.join(socket.data.user._id.toString())

    const users = await getUsers()

    // notify auth user about users fetched
    socket.emit(
      'users_fetched',
      users.map((user) => instanceToPlain(new UserResource(user.toJSON())))
    )

    // notify other users about auth user connection status as connected
    socket.broadcast.emit(
      'user_connected',
      instanceToPlain(new UserResource(socket.data.user.toJSON()))
    )

    // recover state on reconnect
    if (!socket.recovered && socket.handshake.auth.disconnectedAt) {
      const messages = await getReceiverPendingPrivateMessages(
        socket.data.user._id.toString(),
        socket.handshake.auth.disconnectedAt
      )

      messages.forEach((message) => {
        // resend pending private messages to auth user
        socket.emit(
          'private_message_sent',
          instanceToPlain(new MessageResource(message.toJSON()))
        )
      })
    }
  })
}
