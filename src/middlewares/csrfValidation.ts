import { RequestHandler } from 'express'
import { validateRequest } from '@/services/csrfService'
import { StatusCodes } from 'http-status-codes'

const csrfValidation: RequestHandler = (req, res, next) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
    !validateRequest(req)
  ) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: 'Invalid CSRF token',
    })
  }

  next()
}

export default csrfValidation
