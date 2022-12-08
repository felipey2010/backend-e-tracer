const { verify } = require("jsonwebtoken")
require("dotenv").config()

const verifyToken = async req => {
  try {
    const token = req.headers["smd-usrtkn"] || req.body.token

    if (!token || token === undefined) {
      return { success: false, error: "Nenhum token recebido" }
    }

    const result = verify(token, process.env.JWT_SECRET)

    console.log("Result: ", result)

    if (result) {
      return { success: true, token: token, result: result }
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

module.exports = { verifyToken }
