import { Router } from 'express'
import { auth } from './auth.middleware'
import authCtrl from './auth.controller'
import adminRoute from '../admin/route'
import { resetPasswordRules, userRegisterRules } from './auth.validation'
import { validate } from 'src/validator'

const router = Router()

router.use('/admin', adminRoute)
router.post('/register', userRegisterRules(), validate, authCtrl.register)
router.post('/login/facebook', authCtrl.loginWithFacebook)
router.post('/login/google', authCtrl.loginWithGoogle)
router.post('/login', authCtrl.login)
router.get('/me', auth(), authCtrl.getUserInfo)
router.post('/refresh-token', authCtrl.refreshToken)
router.post('/forgot-password', authCtrl.forgotPassword)
router.post('/reset-password', resetPasswordRules(), validate, authCtrl.resetPassword)

export default router
