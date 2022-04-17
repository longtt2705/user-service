import { body } from 'express-validator'

export const userRegisterRules = () => {
  console.log('>>>>>>user rules')
  return [
    body('email').isEmail().withMessage('invalid email'),
    body('username').exists({ checkFalsy: true }).withMessage('username is required'),
    // password must be at least 6 characters
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
    body('phone')
      .optional()
      .escape()
      .matches(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)
      .withMessage('invalid phone number'),
  ]
}

export const resetPasswordRules = () => {
  return [
    // password must be at least 6 characters
    body('newPassword').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  ]
}
