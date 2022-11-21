const { pool, comparePasswords, createHash } = require("../../db")
const { sign, verify } = require("jsonwebtoken")
const generate = require("nanoid/generate")
const { getPasswordResetTemplate } = require("../templates/passwordReset")
const { sendMail } = require("../Mailer/Mail")
require("dotenv").config()

const secret = process.env.DB_SECRET

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
        message: "Nenhum usuário encontrado",
      })
    }

    const saved_person = {
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
      message: "Usuário encontrado",
      person: saved_person,
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
  async checkToken(req, res) {
    const token = req.body.token || req.params.token

    if (!token) {
      return res.status(403).json({
        success: false,
        message: "É necessário se autenticar",
      })
    }

    verify(token, secret, async function (err, decoded) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Erro interno - 120",
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

    verify(token, secret, async function (err, decoded) {
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
  async send_code_to_email(req, res) {
    const { login, email, person_id } = req.body
    let flag = 0
    let error = ""

    const data = await pool.query(
      "SELECT * FROM public.password_reset_requests WHERE user_id = $1 AND date_verified IS null",
      [person_id]
    )

    if (data.rowCount > 0) {
      verify(
        data.rows[0].password_reset_token,
        secret,
        async function (err, decoded) {
          if (err) {
            flag = 1
            error = err.message
          }

          if (decoded.login) {
            flag = 2
          }
        }
      )
    }

    if (flag === 1) {
      return res.status(500).json({
        success: false,
        message: "O código de verificação expirou",
        error: error,
        error_type: "expired code",
      })
    } else if (flag === 2) {
      return res.status(500).json({
        success: false,
        message:
          "Informe o código enviado. Se nunca solicitou, entre em contato com o admin",
        error: error,
        error_type: "request already solicited",
        reset_token: data.rows[0].password_reset_token,
      })
    }

    const verification_code = generate("1234567890abcdef", 7)

    const htmlTemplate = getPasswordResetTemplate(verification_code)

    const text_message =
      "Seu código de solicitação de senha é: " + verification_code

    sendMail(email, "RECUPERAÇÃO DE SENHA", text_message, htmlTemplate).catch(
      error => {
        console.log(error)
      }
    )

    const payload = { login }
    const password_reset_token = sign(payload, secret, {
      expiresIn: "12h",
    })

    const queryText =
      "INSERT INTO public.password_reset_requests(user_id, verification_code, date_created, date_verified," +
      " password_reset_token) VALUES ($1, $2, $3, $4, $5) RETURNING *"

    const values = [
      person_id,
      verification_code,
      new Date(),
      null,
      password_reset_token,
    ]

    await pool
      .query(queryText, values)
      .then(() => {
        return res
          .cookie("pwdtoken", password_reset_token, { httpOnly: true })
          .status(200)
          .json({
            success: true,
            message: "Código de verificação enviada para seu e-mail",
            reset_token: password_reset_token,
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
  },
  async verify_password_reset_code(req, res) {
    const { code, person_id, token } = req.body
    let flag = 0
    let error = ""

    const data = await pool.query(
      "SELECT * FROM public.password_reset_requests WHERE user_id = $1 AND date_verified IS null",
      [person_id]
    )
    if (data.rowCount === 0) {
      return res.json({
        success: false,
        message: "Nenhum usuário encontrado",
      })
    }

    if (data.rowCount > 0) {
      verify(token, secret, async function (err, decoded) {
        if (err) {
          flag = 1
          error = err.message
        }
      })
    }

    if (flag === 1) {
      return res.status(500).json({
        success: false,
        message: "O código de verificação expirou",
        error: error,
        error_type: "expired code",
      })
    }

    const queryText =
      "UPDATE public.password_reset_requests SET id=$1, user_id=$2, verification_code=$3, date_created=$4," +
      "date_verified=$5, password_reset_token=$6 WHERE user_id = $7 AND date_verified IS null"

    const values = [
      data.rows[0].id,
      data.rows[0].user_id,
      data.rows[0].verification_code,
      data.rows[0].date_created,
      new Date(),
      data.rows[0].password_reset_token,
      person_id,
    ]

    if (code === data.rows[0].verification_code) {
      await pool
        .query(queryText, values)
        .then(() => {
          return res.status(200).json({
            success: true,
            message: "Verificação dos códigos feita com êxito",
          })
        })
        .catch(error => {
          console.log(error)
          return res.status(500).json({
            success: false,
            message: "Erro do servidor",
            error: error,
            error_code: "X901",
          })
        })
    } else {
      return res.status(500).json({
        success: false,
        message: "Os códigos não correspondem",
        error_code: "X902",
      })
    }
  },
  async reset_password(req, res) {
    const { new_password, token, verification_code, person_id, login } =
      req.body
    let flag = 0
    let error = ""

    if (token) {
      verify(token, secret, async function (err, decoded) {
        if (err) {
          flag = 1
          error = err.message
        }
      })
    } else {
      return res.status(500).json({
        success: false,
        message: "Houve um erro de token. Por favor, tente de novo",
        error: error,
      })
    }

    if (flag === 1) {
      return res.status(500).json({
        success: false,
        message:
          "O token expirou. Por favor, reinicie o proceso da recuperação",
        error: error,
      })
    }

    const data = await pool.query(
      "SELECT * FROM public.persons WHERE cpf = $1 AND id=$2",
      [login, person_id]
    )

    if (data.rowCount === 0) {
      return res.json({
        success: false,
        message: "Nenhum usuário encontrado",
      })
    }

    const queryText =
      "UPDATE public.persons SET id=$1, sex=$2, name=$3, birthdate=$4," +
      "email=$5, password=$6, date_registered=$7, term_agreed=$8, last_accessed=$9," +
      " cpf=$10 WHERE cpf = $11 AND id=$12"

    const values = [
      data.rows[0].id,
      data.rows[0].sex,
      data.rows[0].name,
      data.rows[0].birthdate,
      data.rows[0].email,
      await createHash(new_password),
      data.rows[0].date_registered,
      data.rows[0].term_agreed,
      new Date(),
      data.rows[0].cpf,
      data.rows[0].cpf,
      data.rows[0].id,
    ]

    await pool
      .query(queryText, values)
      .then(result => {
        console.log(result)
        const person = {
          id: result.rows[0].id,
          cpf: result.rows[0].cpf,
          sex: result.rows[0].sex,
          name: result.rows[0].name,
          birthdate: result.rows[0].birthdate,
          email: result.rows[0].email,
          date_registered: result.rows[0].date_registered,
          term_agreed: result.rows[0].term_agreed,
          last_accessed: result.rows[0].last_accessed,
        }

        return res.status(200).json({
          success: true,
          message: "Efetuar login com novo credencial",
          person: person,
        })
      })
      .catch(error => {
        console.log(error)
        return res.status(500).json({
          success: false,
          message: "Erro do servidor",
          error: error,
          error_code: "X801",
        })
      })
  },
}
