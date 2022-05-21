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
  return smtpTransport.sendMail(mailOptions, (error) => {
    if (error) {
      debug.log('Mail error', error)
    }
  })
}

export const generateRuleNotifcationTemplate = (tittle, message, url) => {
  return `
      <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
      <h2 style="text-align: center; text-transform: uppercase;color: teal;">${tittle}</h2>
      <p>
          ${message}
      </p>
      
      <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">Go to campaign</a>
  
      <p>If the button doesn't work for any reason, you can also click on the link below:</p>
  
      <div>${url}</div>
      </div>
  `
}
