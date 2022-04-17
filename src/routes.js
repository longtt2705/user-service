import { Router } from 'express'
import authRouter from 'src/modules/auth/auth.route'
import userRouter from 'src/modules/users/user.route'

const router = Router()

router.use('/auth', authRouter)
router.use('/', userRouter)

export default router
