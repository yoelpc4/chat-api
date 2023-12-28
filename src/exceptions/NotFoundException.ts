import { StatusCodes } from 'http-status-codes'
import HttpException from '@/exceptions/HttpException'

export default class NotFoundException extends HttpException {
  code = StatusCodes.NOT_FOUND

  constructor(message = 'Not Found') {
    super(message)
  }
}
