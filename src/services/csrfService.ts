import { doubleCsrf } from 'csrf-csrf'

export const { validateRequest, generateToken } = doubleCsrf({
  cookieName: process.env.CSRF_COOKIE_NAME,
  cookieOptions: {
    domain: process.env.CSRF_COOKIE_DOMAIN,
    secure: process.env.CSRF_COOKIE_SECURE === 'true',
    sameSite: 'lax',
  },
  getSecret: () => process.env.CSRF_SECRET!,
})
