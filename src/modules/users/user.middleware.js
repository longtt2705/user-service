import { StatusCodes } from 'http-status-codes'
import { MESSAGE } from 'src/shared/message'

const checkPermission = (role) => async (req, res, next) => {
  try {
    const user = req.user
    const isPermissionValid = user.role === role
    if (isPermissionValid) {
      return next()
    }
    return res.status(StatusCodes.FORBIDDEN).send(MESSAGE.PERMISSION_ERROR)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return res.status(StatusCodes.FORBIDDEN).send(MESSAGE.PERMISSION_ERROR)
  }
}

export default checkPermission
