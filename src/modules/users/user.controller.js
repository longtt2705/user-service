import { OAuth2Client } from 'google-auth-library'
import { StatusCodes } from 'http-status-codes'
import { get } from 'lodash'
import db from 'src/models'
import { MESSAGE } from 'src/shared/message'
import debug from 'src/utils/debug'
import { sendUpdateConnectToFacebook, sendUpdateConnectToGoogle } from '../redis/ads-service'
import * as userService from './user.service'

export const getAll = async (req, res) => {
  const users = await userService.getAll()
  res.json(users)
}

export const deleteUser = async (req, res) => {
  const { userId } = req.params
  try {
    const result = await userService.deleteUser(userId)
    return res.json(result)
  } catch (err) {
    debug.log('DeleteUser', err)
    res.status(StatusCodes.BAD_REQUEST).json({ message: MESSAGE.DELETE_FAILED })
  }
}

export const updateUser = async (req, res) => {
  const { userId } = req.params
  const userInfo = { ...req.body }
  try {
    const result = await userService.updateUser(userId, userInfo)
    return res.json(result)
  } catch (err) {
    debug.log('UpdateUser', err)
    res.status(StatusCodes.BAD_REQUEST).json({ message: MESSAGE.UPDATE_FAILED })
  }
}

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body

  try {
    const user = await db.User.authenticate(req.user.username, oldPassword)
    if (user) {
      if (oldPassword === newPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: MESSAGE.SAME_NEW_PASSWORD })
      }
      const result = await userService.changePasswordById(user.id, newPassword)

      if (result) {
        return res.json({ message: MESSAGE.CHANGE_PASSWORD_SUCCESSFULLY })
      }
      return res.status(StatusCodes.BAD_REQUEST).json({ message: MESSAGE.UPDATE_FAILED })
    }
    res.status(StatusCodes.BAD_REQUEST).json({ message: MESSAGE.OLD_PASSWORD_INCORRECT })
  } catch (err) {
    debug.log('Change Password', err)
    res.status(StatusCodes.BAD_REQUEST).json({ message: MESSAGE.UPDATE_FAILED })
  }
}

export const connectToGoogle = async (req, res) => {
  const { code } = req.body
  try {
    const { CLIENT_ID, CLIENT_SECRET } = process.env
    const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET)
    const token = await userService.getTokenByCode(code)
    const ticket = await client.verifyIdToken({
      idToken: get(token, 'id_token'),
      audience: process.env.CLIENT_ID,
    })

    sendUpdateConnectToGoogle({
      token,
      userId: ticket.getUserId(),
      user: req.user,
      information: ticket.getPayload(),
    })

    return res.status(StatusCodes.OK).json({ message: MESSAGE.CONNECT_SUCCESSFULLY })
  } catch (err) {
    debug.log('Connect Google account', err)
    res.status(StatusCodes.BAD_REQUEST).json({ message: MESSAGE.CONNECT_FAILED })
  }
}

export const connectToFacebook = async (req, res) => {
  const user = req.user
  const { accessToken, userID: fbUserId, name, picture } = req.body

  try {
    const longLiveAccessToken = await userService.getFacebookLongLiveAccessToken(accessToken)
    sendUpdateConnectToFacebook({ fbUserId, longLiveAccessToken, name, picture, user })

    return res.status(StatusCodes.OK).json({ message: MESSAGE.CONNECT_SUCCESSFULLY })
  } catch (err) {
    debug.log('Connect-Facebook-Account', err)
    res.status(StatusCodes.BAD_REQUEST).json({ message: MESSAGE.CONNECT_FAILED })
  }
}
