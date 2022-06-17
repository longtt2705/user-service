import axios from 'axios'
import { OAuth2Client } from 'google-auth-library'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import db from 'src/models'
import * as userService from 'src/modules/users/user.service'
import { randomString } from 'src/utils/crypto'
import debug from 'src/utils/debug'

export const loginWithFacebook = async (fbAccessToken) => {
  const response = await axios.get(`${process.env.FACEBOOK_API_URL}/me`, {
    params: { access_token: fbAccessToken, fields: 'name,email' },
  })
  const { name, email } = response.data
  let user = await db.User.findOne({ where: { email } })
  if (!user) {
    debug.log('Login With Facebook', 'User not exist, create one')

    user = await userService.createUser({
      email,
      username: email,
      password: randomString(),
      firstName: name,
    })
  }
  return user
}

export const loginWithGoogle = async (ggLoginCode) => {
  const { CLIENT_ID, CLIENT_SECRET } = process.env
  const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET)
  const token = await userService.getTokenByCode(ggLoginCode)
  const ticket = await client.verifyIdToken({
    idToken: get(token, 'id_token'),
    audience: CLIENT_ID,
  })

  const { email } = ticket.payload
  let user = await db.User.findOne({ where: { email } })
  if (isEmpty(user)) {
    debug.log('Login With Google', 'User not exist, create one')
    user = await userService.createUser({
      email,
      username: email,
      password: randomString(),
    })
  }
  return user
}
