import httpStatusCodes from 'http-status-codes'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { ROLE } from 'src/utils/constants'

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
    if (user.role !== ROLE.ADMIN) {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'You must use admin account to login into this page.',
      })
    }
    req.logIn(user, { session: false }, (loginErr) => {
      if (loginErr) {
        return next(loginErr)
      }
      const token = jwt.sign({ userId: user.id }, process.env.SECRET || 'meomeo')
      return res.json({
        success: true,
        message: 'authentication succeeded',
        token,
        user,
      })
    })
  })(req, res, next)
}

export default { login }
