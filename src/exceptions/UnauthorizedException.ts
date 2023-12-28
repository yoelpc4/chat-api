import { StatusCodes } from 'http-status-codes'
import HttpException from '@/exceptions/HttpException'

export default class UnauthorizedException extends HttpException {
  code = StatusCodes.UNAUTHORIZED

  constructor(message = 'Unauthorized') {
    super(message)
  }
}
