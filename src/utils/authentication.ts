import { Request } from 'express'
import passport from 'passport'
import { Strategy, StrategyOptions } from 'passport-jwt'
import { JwtPayload } from 'jsonwebtoken'
import { findUser } from '@/services/userService'

const options: StrategyOptions = {
  issuer: process.env.JWT_ISSUER,
  secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
  jwtFromRequest: (req: Request) =>
    req.cookies[process.env.JWT_ACCESS_TOKEN_COOKIE_NAME!],
}

export const initialize = () => {
  passport.use(
    new Strategy(options, async ({ sub }: JwtPayload, callback) => {
      try {
        if (!sub) {
          return callback(null, false)
        }

        const user = await findUser(sub)

        return callback(null, user ?? false)
      } catch (error) {
        return callback(error)
      }
    })
  )
}
