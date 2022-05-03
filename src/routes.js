import { Router } from 'express'
import authRouter from 'src/modules/auth/auth.route'
import userRouter from 'src/modules/users/user.route'
import internalRouter from 'src/modules/internal/route'

const router = Router()

router.use('/auth', authRouter)
router.use('/internal', internalRouter)
router.use('/', userRouter)

export default router
