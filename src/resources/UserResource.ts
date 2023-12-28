import { Exclude, Transform } from 'class-transformer'
import { Types } from 'mongoose'

export default class UserResource {
  @Transform(({ obj }) => obj._id.toString(), { toPlainOnly: true })
  _id: Types.ObjectId

  username?: string

  @Exclude()
  password?: string

  isConnected?: boolean

  createdAt?: string

  updatedAt?: string

  constructor(data: Partial<UserResource>) {
    Object.assign(this, data)
  }
}
