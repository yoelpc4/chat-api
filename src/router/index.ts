import { Router } from 'express'
import authRouter from '@/router/authRouter'
import throttle from '@/middlewares/throttle'
import csrfValidation from '@/middlewares/csrfValidation'
import { getCsrfToken } from '@/controllers/csrfController'

const router = Router()

router.use(throttle)

router.get('/csrf-token', getCsrfToken)

router.use(csrfValidation)

router.use('/auth', authRouter)

export default router
