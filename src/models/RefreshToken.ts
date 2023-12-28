import { model, Schema } from 'mongoose'
import { IRefreshToken, ModelTypes } from '@/types'

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: ModelTypes.User,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default model(ModelTypes.RefreshToken, refreshTokenSchema)
