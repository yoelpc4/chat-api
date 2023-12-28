import { Document, Types } from 'mongoose'

export * from '@/types/ClientToServerEvents'

export * from '@/types/ServerToClientEvents'

export * from '@/types/InterServerEvents'

export interface SocketData {
  user: UserDocument
}

export interface IUser {
  _id: Types.ObjectId
  username: string
  password: string
  isConnected: boolean
  createdAt: string
  updatedAt: string
  messages: Types.DocumentArray<IMessage>
}

export type UserDocument = Document<unknown, object, IUser> &
  IUser &
  Required<{ _id: Types.ObjectId }>

export interface IMessage {
  _id: Types.ObjectId
  from: Types.ObjectId
  to: Types.ObjectId
  body: string
  clientOffset: string
  createdAt: string
  updatedAt: string
}

export interface IRefreshToken {
  _id: Types.ObjectId
  user: Types.ObjectId
  token: string
  createdAt: string
  updatedAt: string
}

export enum ModelTypes {
  User = 'User',
  Message = 'Message',
  RefreshToken = 'RefreshToken',
}
