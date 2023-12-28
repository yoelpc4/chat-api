import { Router } from 'express'
import {
  register,
  login,
  getUser,
  refresh,
  logout,
} from '@/controllers/authController'
import auth from '@/middlewares/auth'

const router = Router()

router.post('/register', register)

router.post('/login', login)

router.post('/refresh', refresh)

router.post('/logout', logout)

router.get('/user', auth, getUser)

export default router
