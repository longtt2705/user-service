import nodemailer from 'nodemailer'
import debug from './debug'

// async..await is not allowed in global scope, must use a wrapper
// create reusable transporter object using the default SMTP transport
const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

export const sendMailWithHtml = (subject, receiver, html) => {
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: receiver,
    subject,
    html,
  }
  smtpTransport.sendMail(mailOptions, (error) => {
    if (error) {
      debug.log('Mail error', error)
    }
  })
}
