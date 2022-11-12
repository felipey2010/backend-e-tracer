require("dotenv").config()
const PRODUCTION = process.env.DB_PRODUCTION

module.exports = {
  async getInitialSettings(req, res) {
    const settings = {
      local: PRODUCTION === "true" ? "PROD" : "LOCAL",
    }

    return res.status(200).json({
      success: true,
      data: settings,
    })
  },
}
