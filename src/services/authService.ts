import { hash, verify as verifyHash } from 'argon2'
import { DateTime } from 'luxon'
import { JwtPayload, sign, verify as verifyJwt } from 'jsonwebtoken'
import User from '@/models/User'
import RefreshToken from '@/models/RefreshToken'
import LoginDto from '@/dto/LoginDto'
import RegisterDto from '@/dto/RegisterDto'
import RefreshTokenDto from '@/dto/RefreshTokenDto'
import UnauthorizedException from '@/exceptions/UnauthorizedException'

const signAccessToken = (id: string) => {
  const now = DateTime.now()

  const payload: JwtPayload = {
    iss: process.env.JWT_ISSUER,
    sub: id,
    iat: now.toUnixInteger(),
    exp: now.plus({ minutes: 15 }).toUnixInteger(),
  }

  return sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET!)
}

const signRefreshToken = async (id: string) => {
  const now = DateTime.now()

  const payload: JwtPayload = {
    iss: process.env.JWT_ISSUER,
    sub: id,
    iat: now.toUnixInteger(),
    exp: now.plus({ day: 1 }).toUnixInteger(),
  }

  const refreshToken = sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET!)

  await RefreshToken.deleteMany({
    user: id,
  })

  await RefreshToken.create({
    user: id,
    token: await hash(refreshToken),
  })

  return refreshToken
}

export const register = async (dto: RegisterDto) => {
  const user = await User.create({
    username: dto.username,
    password: await hash(dto.password),
    isConnected: false,
  })

  const accessToken = signAccessToken(user._id.toString())

  const refreshToken = await signRefreshToken(user._id.toString())

  return {
    user,
    accessToken,
    refreshToken,
  }
}

export const login = async (dto: LoginDto) => {
  const user = await User.findOne({
    username: dto.username,
  }).exec()

  if (!user) {
    throw new UnauthorizedException()
  }

  const isPasswordMatch = await verifyHash(user.password, dto.password)

  if (!isPasswordMatch) {
    throw new UnauthorizedException()
  }

  const accessToken = signAccessToken(user._id.toString())

  const refreshToken = await signRefreshToken(user._id.toString())

  return {
    user,
    accessToken,
    refreshToken,
  }
}

export const refresh = async (dto: RefreshTokenDto) => {
  if (!dto.token) {
    throw new UnauthorizedException('Invalid refresh token')
  }

  const { sub } = verifyJwt(dto.token, process.env.JWT_REFRESH_TOKEN_SECRET!, {
    issuer: process.env.JWT_ISSUER,
  })

  if (!sub) {
    throw new UnauthorizedException('Invalid refresh token')
  }

  const refreshToken = await RefreshToken.findOne({
    user: sub,
  })

  if (!refreshToken) {
    throw new UnauthorizedException('Invalid refresh token')
  }

  const isRefreshTokenMatch = await verifyHash(refreshToken.token, dto.token)

  if (!isRefreshTokenMatch) {
    throw new UnauthorizedException('Invalid refresh token')
  }

  return signAccessToken(sub.toString())
}
