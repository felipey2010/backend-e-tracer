const { pool, comparePasswords, createHash } = require("../utils/db")
const { sign, verify } = require("jsonwebtoken")
require("dotenv").config()
const { verifyToken } = require("../middleware/auth")

const secret = process.env.JWT_SECRET

module.exports = {
  async get_rooms(req, res) {
    let error = ""

    const verified = verifyToken(error)

    if (!verified) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado!",
        error: error,
      })
    }

    await pool
      .query("SELECT * FROM public.rooms")
      .then(result => {
        return res.status(200).json({
          success: true,
          message: "Lista de salas cadastradas",
          data: result.rows,
        })
      })
      .catch(error => {
        console.log(error)
        return res.status(500).json({
          success: false,
          message: "Erro ao consultar salas",
          error: error,
        })
      })
  },
  async register(req, res) {
    const { name, person_id, icon } = req.body

    let error = ""

    const verified = verifyToken(error)

    if (!verified) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado!",
        error: error,
      })
    }

    const data = await pool.query(
      "SELECT * FROM public.rooms WHERE name = $1",
      [name]
    )

    if (data.rowCount > 0) {
      return res.status(500).json({
        success: false,
        message: "Sala já foi cadastrada",
      })
    }

    const queryText =
      "INSERT INTO public.rooms(name, user_id, icon, date_created)" +
      " VALUES ($1, $2, $3, $4) RETURNING *"

    const new_room = [name, person_id, icon, new Date()]

    await pool
      .query(queryText, new_room)
      .then(() => {
        return res.status(201).json({
          success: true,
          message: "Cadastro de sala realizado",
        })
      })
      .catch(error => {
        return res.status(500).json({
          success: false,
          message: "Erro ao cadastrar sala",
          error: error,
        })
      })
  },
  async update(req, res) {
    const { login, password, date_accessed } = req.body
    let error = ""

    const verified = verifyToken(error)

    if (!verified) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado!",
        error: error,
      })
    }

    const data = await pool.query(
      "SELECT * FROM public.persons WHERE cpf = $1",
      [login]
    )

    if (data.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado",
      })
    }

    if (data.rowCount > 1) {
      return res.status(500).json({
        success: false,
        message: "CPF duplicado. Entre em contato com administrador",
      })
    }

    const dbPass = data.rows[0].password

    comparePasswords(password, dbPass, async function (err, isMatch) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Erro interno",
          error: err,
        })
      }

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Credenciais incorretas",
        })
      }

      const queryText =
        "UPDATE public.persons SET cpf = $1, sex = $2, name = $3, birthdate = $4, email = $5," +
        " password = $6, date_registered = $7, term_agreed = $8, last_accessed = $9, id = $10 WHERE cpf = $11"

      const values = [
        data.rows[0].cpf,
        data.rows[0].sex,
        data.rows[0].name,
        data.rows[0].birthdate,
        data.rows[0].email,
        data.rows[0].password,
        data.rows[0].date_registered,
        data.rows[0].term_agreed,
        date_accessed,
        data.rows[0].id,
        data.rows[0].cpf,
      ]

      await pool
        .query(queryText, values)
        .then(async () => {
          const email = data.rows[0].email
          const payload = { email }
          const token = await sign(payload, secret, {
            expiresIn: "2h",
          })

          const person = {
            cpf: data.rows[0].cpf,
            sex: data.rows[0].sex,
            name: data.rows[0].name,
            birthdate: data.rows[0].birthdate,
            email: data.rows[0].email,
            date_registered: data.rows[0].date_registered,
            term_agreed: data.rows[0].term_agreed,
            last_accessed: data.rows[0].last_accessed,
            id: data.rows[0].id,
          }

          return res
            .cookie("token", token, { httpOnly: true })
            .status(200)
            .json({
              success: true,
              message: "Usuário autenticado",
              token: token,
              person: person,
            })
        })
        .catch(error => {
          console.log(error)
          return res.status(500).json({
            success: false,
            message: "Erro do servidor",
            error: error,
          })
        })
    })
  },
  async delete(req, res) {
    const { room_id } = req.body
    let error = ""

    const verified = verifyToken(error)

    if (!verified) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado!",
        error: error,
      })
    }

    await pool
      .query("DELETE room FROM public.rooms WHERE room.id = $1", [room_id])
      .then(() => {
        return res.status(200).json({
          success: true,
          message: "Sala excluída",
        })
      })
      .catch(error => {
        return res.status(500).json({
          success: false,
          message: "Erro ao excluir sala",
          error: error.message,
        })
      })
  },
}
