import * as _jwtStrategy from './auth/jwt.strategy'
import * as _localStrategy from './auth/local.strategy'
import routes from './routes'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import createError from 'http-errors'
import logger from 'morgan'
import passport from 'passport'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUI from 'swagger-ui-express'
import { MESSAGE } from './shared/message'
import debug from './utils/debug'
import 'express-async-errors'
import { initQueue } from './modules/redis'

require('dotenv').config()
// const options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Classroom API',
//       version: '1.0.0',
//       description:
//         'This is a simple CRUD API application made with Express and documented with Swagger',
//     },
//     servers: [
//       {
//         url: `${process.env.API_URL}`,
//       },
//     ],
//   },
//   /* This 2 lines disable Try it out button, because our API require Authenticate */
//   tryItOutEnabled: false,
//   supportedSubmitMethods: [],
//   /* *** */
// apis: ['src/controllers/*.js'],
// }
const app = express()

app.use(cors())
app.use(passport.initialize())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// const specs = swaggerJSDoc(options)
// app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs))
app.use('/users', routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  debug.log('Error', err.message)
  // render the error page
  res.status(err.status || 500).json({ mesage: MESSAGE.UNEXPECTED_ERROR })
})
initQueue()

export default app
