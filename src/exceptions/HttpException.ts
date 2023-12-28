import { StatusCodes } from 'http-status-codes'

export default abstract class HttpException extends Error {
  code: StatusCodes

  message: string

  protected constructor(message: string) {
    super(message)

    this.message = message
  }
}
