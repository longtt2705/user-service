import { body } from 'express-validator'

export const changePasswordRules = () => {
  return [
    // password must be at least 6 characters
    body('oldPassword')
      .isLength({ min: 6 })
      .withMessage('Old password must be at least 6 characters'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ]
}
