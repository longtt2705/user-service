import { v4 } from 'uuid'
import jwt from 'jsonwebtoken'

const config = {
  jwtExpiration: 3600, // 1 hour
  jwtRefreshExpiration: 86400, // 24 hours
  /* for test */
  // jwtExpiration: 60, // 1 minute
  // jwtRefreshExpiration: 120, // 2 minutes
}

export default (sequelize, Sequelize) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    token: {
      type: Sequelize.STRING,
    },
    userId: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    expiryDate: {
      type: Sequelize.DATE,
    },
  })
  RefreshToken.createToken = async function (user) {
    let expiredAt = new Date()
    expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration)
    let _token = v4()
    let refreshToken = await this.create({
      token: _token,
      userId: user.id,
      expiryDate: expiredAt.getTime(),
    })
    return refreshToken.token
  }
  RefreshToken.verifyExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime()
  }

  RefreshToken.createAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.SECRET || 'meomeo', {
      expiresIn: config.jwtExpiration,
    })
  }
  return RefreshToken
}
