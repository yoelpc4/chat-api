import { CookieOptions, RequestHandler } from 'express'
import { DateTime } from 'luxon'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import { StatusCodes } from 'http-status-codes'
import * as authService from '@/services/authService'
import LoginDto from '@/dto/LoginDto'
import RegisterDto from '@/dto/RegisterDto'
import RefreshTokenDto from '@/dto/RefreshTokenDto'
import UserResource from '@/resources/UserResource'
import UnauthorizedException from '@/exceptions/UnauthorizedException'
import { UserDocument } from '@/types'
import { loginValidator, registerValidator } from '@/validators/authValidator'

const accessTokenCookieName = process.env.JWT_ACCESS_TOKEN_COOKIE_NAME!

const getAccessTokenCookieOptions = (): CookieOptions => ({
  domain: process.env.JWT_COOKIE_DOMAIN,
  secure: process.env.JWT_COOKIE_SECURE === 'true',
  httpOnly: true,
  sameSite: 'lax',
  expires: DateTime.now().plus({ minutes: 15 }).toJSDate(),
})

const refreshTokenCookieName = process.env.JWT_REFRESH_TOKEN_COOKIE_NAME!

const getRefreshTokenCookieOptions = (): CookieOptions => ({
  domain: process.env.JWT_COOKIE_DOMAIN,
  secure: process.env.JWT_COOKIE_SECURE === 'true',
  httpOnly: true,
  sameSite: 'lax',
  expires: DateTime.now().plus({ day: 1 }).toJSDate(),
})

export const register: RequestHandler = async (req, res, next) => {
  try {
    const data = registerValidator.parse(req.body)

    const dto = plainToInstance(RegisterDto, data, {
      excludeExtraneousValues: true,
    })

    const { user, accessToken, refreshToken } = await authService.register(dto)

    res
      .status(StatusCodes.CREATED)
      .cookie(accessTokenCookieName, accessToken, getAccessTokenCookieOptions())
      .cookie(
        refreshTokenCookieName,
        refreshToken,
        getRefreshTokenCookieOptions()
      )
      .json({
        user: instanceToPlain(new UserResource(user.toJSON())),
      })
  } catch (error) {
    next(error)
  }
}

export const login: RequestHandler = async (req, res, next) => {
  try {
    const data = loginValidator.parse(req.body)

    const dto = plainToInstance(LoginDto, data, {
      excludeExtraneousValues: true,
    })

    const { user, accessToken, refreshToken } = await authService.login(dto)

    res
      .status(StatusCodes.OK)
      .cookie(accessTokenCookieName, accessToken, getAccessTokenCookieOptions())
      .cookie(
        refreshTokenCookieName,
        refreshToken,
        getRefreshTokenCookieOptions()
      )
      .json({
        user: instanceToPlain(new UserResource(user.toJSON())),
      })
  } catch (error) {
    next(error)
  }
}

export const refresh: RequestHandler = async (req, res, next) => {
  const token = req.cookies[refreshTokenCookieName]

  if (!token) {
    return next(new UnauthorizedException('Invalid refresh token'))
  }

  const dto = plainToInstance(
    RefreshTokenDto,
    { token },
    { excludeExtraneousValues: true }
  )

  try {
    const accessToken = await authService.refresh(dto)

    res
      .status(StatusCodes.OK)
      .cookie(accessTokenCookieName, accessToken, getAccessTokenCookieOptions())
      .send()
  } catch (error) {
    next(error)
  }
}

export const logout: RequestHandler = (req, res) => {
  res
    .status(StatusCodes.NO_CONTENT)
    .clearCookie(accessTokenCookieName, {
      domain: process.env.JWT_COOKIE_DOMAIN,
      path: '/',
    })
    .clearCookie(refreshTokenCookieName, {
      domain: process.env.JWT_COOKIE_DOMAIN,
      path: '/',
    })
    .send()
}

export const getUser: RequestHandler = (req, res) => {
  res
    .status(StatusCodes.OK)
    .json(
      instanceToPlain(new UserResource((req.user as UserDocument).toJSON()))
    )
}
