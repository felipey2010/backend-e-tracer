const { verify } = require("jsonwebtoken")
require("dotenv").config()

const verifyToken = async error => {
  try {
    const token = req.headers["smd-usrtkn"]

    if (!token) {
      error = "Nenhum token recebido"
      return false
    }

    const result = verify(token, process.env.JWT_SECRET)

    if (result) {
      error = ""
      return true
    }
  } catch (err) {
    error = err.message
    return false
  }
}

module.exports = { verifyToken }
