import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import { generateToken } from '@/services/csrfService'

export const getCsrfToken: RequestHandler = (req, res) => {
  const csrfToken = generateToken(req, res)

  res.status(StatusCodes.OK).json({
    csrfToken,
  })
}
