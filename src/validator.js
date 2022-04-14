import { validationResult } from 'express-validator'
import httpStatusCodes from 'http-status-codes'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = {}
  errors.array().map((err) => (extractedErrors[err.param] = err.msg))

  return res.status(httpStatusCodes.BAD_REQUEST).json({
    errors: extractedErrors,
  })
}

export default {
  validate,
}
