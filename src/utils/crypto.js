import bcrypt from 'bcrypt'
import debug from './debug'
const Crypto = require('crypto')

const saltRounds = 10

export async function hashPassword(plainPassword) {
  const hash = await bcrypt.hash(plainPassword, saltRounds).catch((err) => {
    debug.log('Hash', err)
  })
  return hash
}

export async function checkPassword(plainPassword, hash) {
  const result = bcrypt.compare(plainPassword, hash).catch((err) => {
    debug.log('Hash', err)
  })
  return result
}

export function randomString(size = 21) {
  return Crypto.randomBytes(size).toString('base64').slice(0, size)
}
