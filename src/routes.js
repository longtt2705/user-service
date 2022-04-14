import { Router } from 'express'
import authRouter from 'src/modules/auth/auth.route'
import userRouter from 'src/modules/users/user.route'

const router = Router()

router.use('/', userRouter)
router.use('/auth', authRouter)

export default router
