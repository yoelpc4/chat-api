import { Transform } from 'class-transformer'
import { Types } from 'mongoose'

export default class MessageResource {
  @Transform(({ obj }) => obj._id.toString(), { toPlainOnly: true })
  _id: Types.ObjectId

  @Transform(({ obj }) => obj.from.toString(), { toPlainOnly: true })
  from?: Types.ObjectId

  @Transform(({ obj }) => obj.to.toString(), { toPlainOnly: true })
  to?: Types.ObjectId

  body?: string

  clientOffset?: string

  createdAt?: string

  updatedAt?: string

  constructor(data: Partial<MessageResource>) {
    Object.assign(this, data)
  }
}
