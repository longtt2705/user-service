import httpStatusCodes, { StatusCodes } from 'http-status-codes'
import isEmpty from 'lodash/isEmpty'
import isNil from 'lodash/isNil'
import passport from 'passport'
import * as authService from 'src/modules/auth/auth.service'
import * as userService from 'src/modules/users/user.service'
import { MESSAGE } from 'src/shared/message'
import debug from 'src/utils/debug'
import { sendMailWithHtml } from 'src/utils/mailer'
import db from 'src/models'

const NAMESPACE = 'AUTH-CTRL'

export async function register(req, res) {
  const userInfo = { ...req.body }
  const admin = req.user
  const [user, errors] = await userService.createUser(userInfo, !isNil(admin))
  if (!isEmpty(errors)) {
    return res.status(httpStatusCodes.BAD_REQUEST).json({ success: false, errors })
  }
  res.status(httpStatusCodes.CREATED).json({ success: true, message: 'user registered successful' })
}

export async function login(req, res, next) {
  await passport.authenticate('local', { session: false }, function (err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Incorrect username or password',
      })
    }
    req.logIn(user, { session: false }, async (loginErr) => {
      if (loginErr) {
        return next(loginErr)
      }
      const token = db.RefreshToken.createAccessToken(user.id)
      const refreshToken = await db.RefreshToken.createToken(user)

      return res.json({
        success: true,
        message: 'authentication succeeded',
        accessToken: token,
        refreshToken,
        user,
      })
    })
  })(req, res, next)
}

export async function getUserInfo(req, res) {
  res.status(httpStatusCodes.OK).json(req.user)
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body
  if (isEmpty(email)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: MESSAGE.EMAIL_NOT_FOUND })
  }
  const forgotPasswordUser = await userService.getUserByEmail(email)
  if (forgotPasswordUser) {
    const origin = req.get('origin') || process.env.DEFAULT_CLIENT_HOST
    const token = userService.signForgetPasswordToken(email)
    const resetLink = `${origin}/auth/reset-password?token=${token}`
    const htmlContent = `<b>Click this link to reset your password: ${resetLink}</b>`
    sendMailWithHtml('Forgot password', email, htmlContent)
    return res.json({ message: `An email was sent to ${email}` })
  }
  res.status(StatusCodes.BAD_REQUEST).json({ message: MESSAGE.EMAIL_NOT_FOUND })
}

export const resetPassword = async (req, res) => {
  const { token } = req.query
  const { newPassword } = req.body
  try {
    const email = userService.verifyForgetPasswordToken(token)
    if (email) {
      await userService.changePasswordByEmail(email, newPassword)
      return res.json({ message: MESSAGE.CHANGE_PASSWORD_SUCCESSFULLY })
    }
    return res.status(StatusCodes.BAD_REQUEST).json({ message: MESSAGE.BAD_REQUEST_BODY })
  } catch (err) {
    debug.log('Reset Password', err)
    res.status(StatusCodes.BAD_REQUEST).json({ message: MESSAGE.BAD_REQUEST_BODY })
  }
}

export const refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body
  if (requestToken == null) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Refresh Token is required!' })
  }
  try {
    let refreshToken = await db.RefreshToken.findOne({ where: { token: requestToken } })
    if (!refreshToken) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Refresh token is not in database!' })
      return
    }
    if (db.RefreshToken.verifyExpiration(refreshToken)) {
      db.RefreshToken.destroy({ where: { id: refreshToken.id } })

      res.status(StatusCodes.FORBIDDEN).json({
        message: 'Refresh token was expired. Please make a new signin request',
      })
      return
    }
    const user = await refreshToken.getUser()
    const newAccessToken = db.RefreshToken.createAccessToken(user.id)

    return res.json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    })
  } catch (err) {
    debug.log(NAMESPACE, err)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: MESSAGE.BAD_REQUEST_BODY })
  }
}

export const loginWithFacebook = async (req, res) => {
  const { accessToken } = req.body
  try {
    const user = await authService.loginWithFacebook(accessToken)
    if (isEmpty(user)) {
      throw new Error('Empty user')
    }

    const token = db.RefreshToken.createAccessToken(user.id)
    const refreshToken = await db.RefreshToken.createToken(user)

    return res.json({
      success: true,
      message: 'authentication succeeded',
      accessToken: token,
      user,
      refreshToken,
    })
  } catch (err) {
    debug.log('Login With Facebook', err)
    res.status(StatusCodes.BAD_REQUEST).json({ message: 'Login with facebook failed.' })
  }
}

export const loginWithGoogle = async (req, res) => {
  const { code } = req.body
  try {
    const user = await authService.loginWithGoogle(code)
    if (isEmpty(user)) {
      throw new Error('Empty user')
    }

    const loginToken = db.RefreshToken.createAccessToken(user.id)
    const refreshToken = await db.RefreshToken.createToken(user)

    return res.json({
      success: true,
      message: 'authentication succeeded',
      accessToken: loginToken,
      user,
      refreshToken,
    })
  } catch (err) {
    debug.log('Login With Google', err)
    res.status(StatusCodes.BAD_REQUEST).json({ message: 'Login with google failed.' })
  }
}

export default {
  register,
  login,
  getUserInfo,
  forgotPassword,
  resetPassword,
  refreshToken,
  loginWithFacebook,
  loginWithGoogle,
}
