import enVariables from '../config/database.js'
import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'
import debug from 'src/utils/debug.js'

const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const config = enVariables[env]
const db = {}

let sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    logging: false,
  })
}

sequelize
  .authenticate()
  .then(() => {
    debug.log('database', 'Connection has been established successfully.')
  })
  .catch((error) => {
    debug.log('database', 'Unable to connect to the database: ' + error)
  })

fs.readdirSync(__dirname)
  .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  .forEach((file) => {
    // eslint-disable-next-line global-require

    const model = require(path.join(__dirname, file)).default(sequelize, Sequelize.DataTypes)
    db[model.name] = model
  })

db.RefreshToken.belongsTo(db.User, {
  foreignKey: 'userId',
  targetKey: 'id',
})
db.User.hasOne(db.RefreshToken, {
  foreignKey: 'userId',
  targetKey: 'id',
})

db.sequelize = sequelize
db.Sequelize = Sequelize

export default db
