import { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { StatusCodes } from 'http-status-codes'
import HttpException from '@/exceptions/HttpException'

const transformZodFormattedErrors = (
  zodFormattedError: Record<string, any>
) => {
  const errors: Record<string, any> = {}

  for (const key in zodFormattedError) {
    if (key === '_errors') {
      if (
        Array.isArray(zodFormattedError._errors) &&
        zodFormattedError._errors.length
      ) {
        return zodFormattedError._errors[0] as string
      }

      continue
    }

    errors[key] = transformZodFormattedErrors(zodFormattedError[key])
  }

  return errors
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Please fix the following errors',
      errors: transformZodFormattedErrors(err.format()),
    })
  }

  if (err instanceof HttpException) {
    return res.status(err.code).json({
      message: err.message,
    })
  }

  console.error(err)

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: 'Internal server error',
  })
}

export default errorHandler
