import { model, Schema } from 'mongoose'
import { IUser, ModelTypes } from '@/types'

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isConnected: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default model(ModelTypes.User, userSchema)
