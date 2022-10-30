const Pool = require("pg").Pool
require("dotenv").config()
const bcrypt = require("bcrypt")
const saltRound = process.env.SALTROUND

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
})

const createHash = async text => {
  try {
    const salt = await bcrypt.genSalt(Number(saltRound))

    const encryptedPassword = await bcrypt.hash(text, salt)

    return encryptedPassword
  } catch (error) {
    console.log(error)
  }
}

function comparePasswords(userPassword, savedPassword, callback) {
  bcrypt.compare(userPassword, savedPassword, function (err, isMatch) {
    if (err) {
      callback(err)
    } else {
      callback(err, isMatch)
    }
  })
}

module.exports = { pool, createHash, comparePasswords }
