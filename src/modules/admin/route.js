import { Router } from 'express'
import { ROLE } from 'src/utils/constants'
import authCtrl from '../auth/auth.controller'
import checkPermission from '../users/user.middleware'
import { auth } from '../auth/auth.middleware'
import controller from './controller'

const router = Router()

router.post('/login', controller.login)
router.get('/me', auth(), checkPermission(ROLE.ADMIN), authCtrl.getUserInfo)

export default router
