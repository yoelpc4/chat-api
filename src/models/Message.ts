import { model, Schema } from 'mongoose'
import { IMessage, ModelTypes } from '@/types'

const messageSchema = new Schema<IMessage>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: ModelTypes.User,
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: ModelTypes.User,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    clientOffset: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default model(ModelTypes.Message, messageSchema)
