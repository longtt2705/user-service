import { Router } from 'express'
import * as userController from './user.controller'
import { auth } from '../auth/auth.middleware'
import checkPermission from './user.middleware'
import { ROLE } from 'src/utils/constants'
import { changePasswordRules } from './user.validation'
import { validate } from 'src/validator'
import authController from '../auth/auth.controller'

const router = Router()
router.use(auth())

router.get('/', checkPermission(ROLE.ADMIN), userController.getAll)
router.delete('/:userId', checkPermission(ROLE.ADMIN), userController.deleteUser)
router.patch('/:userId/restore', checkPermission(ROLE.ADMIN), userController.restoreUser)
router.put('/:userId', userController.updateUser)
router.post('/change-password', changePasswordRules(), validate, userController.changePassword)
router.get('/connect/google', userController.getGoogleConnection)
router.post('/connect/google', userController.connectToGoogle)
router.get('/connect/facebook', userController.getFacebookConnection)
router.post('/connect/facebook', userController.connectToFacebook)
router.post('/disconnect/google', userController.disconnectGoogle)
router.post('/disconnect/facebook', userController.disconnectFacebook)
router.post('/reconnect/facebook', userController.reconnectToFacebook)
router.post('/', checkPermission(ROLE.ADMIN), authController.register)

export default router
