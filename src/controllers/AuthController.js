const { pool, comparePasswords } = require("../../db")
const jwt = require("jsonwebtoken")

const secret = process.env.SECRET

module.exports = {
  async prelogin(req, res) {
    const { login } = req.body

    const data = await pool.query(
      "SELECT * FROM public.persons WHERE cpf = $1",
      [login]
    )

    if (data.rowCount === 0) {
      return res.json({
        success: false,
        message: "User not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "User found",
      person: data.rows[0],
    })
  },

  async authenticate(req, res) {
    const { login, password, date_accessed } = req.body

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
          const token = await jwt.sign(payload, secret, {
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
  async checkToken(req, res) {
    const token = req.body.token || req.params.token

    if (!token) {
      return res.status(403).json({
        success: false,
        message: "É necessário se autenticar",
      })
    }

    jwt.verify(token, secret, async function (err, decoded) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Erro interno - 120",
          error: err,
        })
      } else {
        const data = await pool.query(
          "SELECT * FROM public.persons WHERE email = $1",
          [decoded.email]
        )

        if (data.rowCount === 0) {
          return res.status(401).json({
            success: false,
            message: "Token inválido",
          })
        }

        if (data.rowCount > 1) {
          return res.status(500).json({
            success: false,
            message: "Registro de e-mail duplicado",
          })
        }

        if (data.rowCount === 1) {
          const found_person = {
            id: data.rows[0].id,
            cpf: data.rows[0].cpf,
            sex: data.rows[0].sex,
            name: data.rows[0].name,
            birthdate: data.rows[0].birthdate,
            email: data.rows[0].email,
            date_registered: data.rows[0].date_registered,
            term_agreed: data.rows[0].term_agreed,
            last_accessed: data.rows[0].last_accessed,
          }

          return res.status(200).json({
            success: true,
            message: "Usuário autenticado",
            person: found_person,
          })
        }
      }
    })
  },
  async logout(req, res) {
    const { token, date_accessed } = req.body

    if (!token) {
      return res.status(403).json({
        success: false,
        message: "Usuário não autenticado",
      })
    }

    jwt.verify(token, secret, async function (err, decoded) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Usuário não autenticado. Efetuar login",
          error: err,
        })
      }

      const data = await pool.query(
        "SELECT * FROM public.persons WHERE email = $1",
        [decoded.email]
      )

      if (data.rowCount === 0) {
        return res.status(401).json({
          success: false,
          message: "Token inválido",
        })
      }

      if (data.rowCount > 1) {
        return res.status(500).json({
          success: false,
          message: "Usuário tem mais que um registro",
        })
      }

      if (data.rowCount === 1) {
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
            return res.status(200).json({
              success: true,
              message: "Logout efetuado com êxito",
            })
          })
          .catch(error => {
            return res.status(500).json({
              success: false,
              message: "Erro de logout",
              error: error,
            })
          })
      }
    })
  },
}
