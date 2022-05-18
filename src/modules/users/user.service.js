import axios from 'axios'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import isEmpty from 'lodash/isEmpty'
import db from 'src/models'
import { MESSAGE } from 'src/shared/message'
import { ACCOUNT_STATUS, ROLE } from 'src/utils/constants'
import { hashPassword } from 'src/utils/crypto'
import debug from 'src/utils/debug'

const NAMESPACE = 'user-service'

export const createUser = async (userInfo) => {
  const { email, username, password, firstName, lastName, phone } = userInfo
  const errors = {}

  // validate register info
  const isExistEmail = !!(await db.User.count({
    where: { email },
    paranoid: false,
  }))
  if (isExistEmail) {
    errors.email = 'email already in use'
  }

  const isExistUsername = !!(await db.User.count({
    where: { username },
    paranoid: false,
  }))
  if (isExistUsername) {
    errors.username = 'username already exists'
  }

  if (!isEmpty(errors)) {
    debug.log('Create User', errors)
    return [null, errors]
  }

  const hash = await hashPassword(password)

  const user = await db.User.create({
    username,
    email,
    password: hash,
    firstName,
    lastName,
    phone,
    role: ROLE.USER,
    // TODO: Change to PENDING when need to verify email
    status: ACCOUNT_STATUS.ACTIVE,
  })

  return [user, null]
}

export const getUserById = (id) => {
  return db.User.findOne({ where: { id } }, { raw: true })
}

export const getAll = () => {
  return db.User.findAll({}, { raw: true })
}

export const deleteUser = (userId) => {
  return db.User.destroy({ where: { id: userId } })
}

export const getUserByEmail = (email) => {
  return db.User.findOne({
    where: { email },
    raw: true,
  })
}

export const signForgetPasswordToken = (email) => {
  const secretKey = process.env.SECRET || 'meomeo'
  return jwt.sign(
    {
      email,
      message: MESSAGE.FORGOT_PASSWORD,
    },
    secretKey
  )
}

export const verifyForgetPasswordToken = (token) => {
  try {
    const secretKey = process.env.SECRET || 'meomeo'
    const decodeData = jwt.decode(token, secretKey)

    if (decodeData.message === MESSAGE.FORGOT_PASSWORD) {
      return decodeData.email
    }
    return null
  } catch (err) {
    debug.log('VerifyForgetPasswordToken', err)
    return null
  }
}

export const changePasswordByEmail = async (email, newPassword) => {
  const hashedPassword = await hashPassword(newPassword)
  return db.User.update({ password: hashedPassword }, { where: { email } })
}

export const changePasswordById = async (id, newPassword) => {
  const hashedPassword = await hashPassword(newPassword)
  return db.User.update({ password: hashedPassword }, { where: { id } })
}

export const updateUser = async (userId, userInfo) => {
  return db.User.update(userInfo, { where: { id: userId } })
}

export const getTokenByCode = async (code) => {
  try {
    const options = {
      url: 'https://accounts.google.com/o/oauth2/token',
      method: 'post',
      data: {
        code: code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: 'postmessage',
      },
    }
    const { data } = await axios(options)
    return data
  } catch (err) {
    debug.log('Refresh token', err.response.data)
    throw err.response.data
  }
}

export const getFacebookLongLiveAccessToken = async (accessToken) => {
  const { FACEBOOK_API_URL, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } = process.env

  try {
    const response = await axios.get(`${FACEBOOK_API_URL}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        fb_exchange_token: accessToken,
      },
    })

    const { access_token } = response.data
    return access_token
  } catch (err) {
    debug.log(NAMESPACE, err)
    throw err
  }
}

export const connectToGoogle = async (id, data) => {
  return db.User.update({ googleConnection: data }, { where: { id } })
}

export const connectToFacebook = async (id, data) => {
  return db.User.update({ facebookConnection: data }, { where: { id } })
}

export const disconnectGoogle = async (userId) => {
  return db.User.update({ googleConnection: null }, { where: { id: userId } })
}

export const disconnectFacebook = async (userId) => {
  return db.User.update({ facebookConnection: null }, { where: { id: userId } })
}

export const getFacebookConnection = async (user) => {
  const { facebookConnection } = user
  const response = await axios.get(`${process.env.FACEBOOK_API_URL}/me`, {
    params: { access_token: facebookConnection.accessToken },
  })
  return response
}

export const getGoogleConnection = async (user) => {
  const { googleConnection } = user
  const { CLIENT_ID, CLIENT_SECRET } = process.env
  const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET)
  // Use refresh token to generate a access token to check if refresh token expired
  // const tmpAccessToken = await client.refreshToken(googleConnection.refreshToken)
  // If success, revoke the token
  // await client.revokeToken(tmpAccessToken.tokens.access_token)
}
