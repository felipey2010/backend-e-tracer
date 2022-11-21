const nodemailer = require("nodemailer")
const { google } = require("googleapis")
require("dotenv").config()

const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET
const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI
const OAUTH_REFRESH_TOKEN = process.env.OAUTH_REFRESH_TOKEN
const OAUTH_USER = process.env.OAUTH_USER

const oAuth2Client = new google.auth.OAuth2(
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI
)

oAuth2Client.setCredentials({ refresh_token: OAUTH_REFRESH_TOKEN })

async function sendMail(to, subject, text, html) {
  try {
    const accessToken = await oAuth2Client.getAccessToken()

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: OAUTH_USER,
        clientId: OAUTH_CLIENT_ID,
        clientSecret: OAUTH_CLIENT_SECRET,
        refreshToken: OAUTH_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    })

    const mailOptions = {
      from: "SmartDashboard API <" + OAUTH_USER + ">",
      to: to,
      subject: subject,
      text: text,
      html: html,
    }

    const result = await transport.sendMail(mailOptions)
    return result
  } catch (error) {
    return error
  }
}

module.exports = { sendMail }
