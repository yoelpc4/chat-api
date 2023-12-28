import Message from '@/models/Message'

export const getReceiverPendingPrivateMessages = (
  to: string,
  disconnectedAt: string
) =>
  Message.find({
    to,
    createdAt: {
      $gt: disconnectedAt,
    },
  })

export const getPrivateMessages = (firstUser: string, secondUser: string) =>
  Message.find({
    $or: [
      { $and: [{ from: firstUser }, { to: secondUser }] },
      { $and: [{ from: secondUser }, { to: firstUser }] },
    ],
  }).exec()

export const isMessageExistsWithClientOffset = async (clientOffset: string) =>
  !!(await Message.exists({
    clientOffset,
  }).exec())

export const createMessage = (
  from: string,
  to: string,
  body: string,
  clientOffset: string
) =>
  Message.create({
    from,
    to,
    body,
    clientOffset,
  })
