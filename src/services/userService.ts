import User from '@/models/User'
import { UserDocument } from '@/types'

export const getUsers = () => User.find().exec()

export const getUsersByIds = (...ids: string[]) =>
  User.find({
    _id: {
      $in: ids,
    },
  }).exec()

export const findUser = (id: string) => User.findById(id).exec()

export const connectUser = async (user: UserDocument) => {
  user.isConnected = true

  await user.save()
}

export const disconnectUser = async (user: UserDocument) => {
  user.isConnected = false

  await user.save()
}
