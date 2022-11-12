const { pool } = require("../../db")
const { sign, verify } = require("jsonwebtoken")
require("dotenv").config()

module.exports = {
  async getNotificationsByUser(req, res) {
    const { user_id } = req.body

    const data = await pool.query(
      "SELECT * FROM public.notifications WHERE user_id = $1",
      [user_id]
    )

    if (data.rowCount === 0) {
      return res.json({
        success: false,
        message: "Nenhuma notificação cadastrada",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Notificação encontrada",
      notifications: data.rows,
    })
  },
  async createNotificationForUser(req, res) {
    const { user_id, message } = req.body

    if (!user_id || message.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Informação incompleta",
      })
    }

    const new_notification = [
      user_id,
      message,
      new Date().toLocaleDateString("pt-BR"),
      false,
    ]

    const queryText =
      "INSERT INTO public.notifications(user_id, message, date_created, read) " +
      "VALUES ($1, $2, $3, $4) RETURNING *"

    await pool
      .query(queryText, new_notification)
      .then(() => {
        return res.status(200).json({
          success: true,
          message: "Notificação criada",
        })
      })
      .catch(error => {
        console.log(error)
        return res.status(500).json({
          success: false,
          message: "Erro ao criar notificação",
          error: error,
        })
      })
  },
}
