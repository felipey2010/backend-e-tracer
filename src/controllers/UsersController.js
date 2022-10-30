const { pool, createHash } = require("../../db")
const jwt = require("jsonwebtoken")

const secret = process.env.SECRET

module.exports = {
  async index(req, res) {
    await pool
      .query("SELECT * FROM public.persons;")
      .then(result => {
        return res.status(200).json({
          success: true,
          message: "Lista de pessoas",
          data: result.rows,
        })
      })
      .catch(err => {
        console.log(err)
        return res.json({
          success: false,
          message: "Erro interno - 200",
          error: err,
        })
      })
  },
  async register(req, res) {
    const {
      cpf,
      sex,
      name,
      birthdate,
      email,
      password,
      date_registered,
      term_agreed,
    } = req.body

    //check if email has already been registered by other person
    const data = await pool
      .query("SELECT * FROM public.persons WHERE email = $1", [email])
      .catch(error => {
        console.log(error)
        return res.status(400).json({
          success: false,
          message: error,
        })
      })

    if (data.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: "O e-mail informado já existe",
      })
    }

    const queryText =
      "INSERT INTO public.persons(cpf, sex, name, birthdate, email, password, date_registered, term_agreed," +
      "last_accessed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *"

    const new_person = [
      cpf,
      sex,
      name,
      birthdate,
      email,
      await createHash(password),
      date_registered,
      term_agreed,
      null,
    ]

    await pool
      .query(queryText, new_person)
      .then(result => {
        const saved_person = {
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

        return res.status(201).json({
          success: true,
          message: "Usuário cadastrado",
          person: saved_person,
        })
      })
      .catch(error => {
        return res.status(400).json({
          success: false,
          message: "Erro ao cadastrar usuário",
          error: error,
        })
      })
  },
  async verifyEmail(req, res) {
    const { email } = req.params

    if (email.length == 0 || !email.includes("@") || !email.includes(".")) {
      return res.status(401).json({
        success: false,
        message: "Informe um e-mail válido",
      })
    }

    const data = await pool
      .query("SELECT * FROM pulic.pessoa where email = $1", [email])
      .catch(() => {
        return res.status(500).json({
          success: false,
          message: "Erro interno - 220",
        })
      })

    if (data.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: "E-mail não encontrado",
      })
    } else {
      return res.status(200).json({
        success: true,
        message: "User found",
      })
    }
  },
  async create_new_person(req, res) {
    const { email, user_id, tipo_pessoa } = req.body

    if (email.length === 0 || !email.includes("@") || !email.includes(".")) {
      return res.status(401).json({
        success: false,
        message: "Informe um e-mail válido",
      })
    }

    const data = await pool
      .query("SELECT * FROM pulic.pessoa where email = $1", [email])
      .catch(() => {
        return res.status(500).json({
          success: false,
          message: "Erro interno - 230",
        })
      })

    if (data.rowCount === 0) {
      //create new user with some default credentials
      const queryText =
        "INSERT INTO public.pessoa(" +
        "user_id, email, date_registered, date_deleted, tipo_pessoa, full_name, end_bairro, end_complemento, " +
        "end_logradouro, end_numero, end_aux_logradouro, end_cep, end_cidade, end_uf" +
        ") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *"

      const values = [
        user_id,
        email,
        new Date(),
        null,
        tipo_pessoa,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]

      await pool
        .query(queryText, values)
        .then(result => {
          return res.json({
            success: true,
            message: "Pessoa cadastrada com êxito",
            user: result.rows[0],
          })
        })
        .catch(() => {
          return res.json({
            success: false,
            message: "Erro interno - 231",
          })
        })
    } else {
      return res.json({
        success: false,
        message: "Já existe um registro com o e-mail informado",
      })
    }
  },
  async get_user_data(req, res) {
    const { token, tipo_pessoa } = req.body

    jwt.verify(token, secret, async function (err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: "Erro interno - 300",
          error: err,
        })
      } else {
        let data
        //Query for pessoa fisica
        if (tipo_pessoa === "PF") {
          data = await pool.query(
            "SELECT * FROM public.users u INNER JOIN public.pessoa p ON (p.user_id = u.id) INNER JOIN public.pessoa_fisica pf ON (pf.pessoa_id = p.id AND u.email= $1);",
            [decoded.email]
          )
        } else {
          data = await pool.query(
            "SELECT * FROM public.users u INNER JOIN public.pessoa p ON (p.user_id = u.id) INNER JOIN public.pessoa_juridica pj ON (pj.pessoa_id = p.id AND u.email= $1);",
            [decoded.email]
          )
        }

        if (data.rowCount === 0) {
          return res.json({
            success: false,
            message: "Nenhuma pessoa encontrada",
          })
        }

        if (data.rowCount > 1) {
          return res.status(500).json({
            success: false,
            message: "Registro de e-mail duplicado",
          })
        }

        if (data.rowCount === 1) {
          return res.status(200).json({
            success: true,
            message: "Pessoa encontrada",
            pessoa: data.rows[0],
          })
        }
      }
    })
  },
}

async function deleteUser(email) {
  await pool
    .query("DELETE FROM public.users WHERE email = $1", [email])
    .then(() => {
      return true
    })
    .catch(() => {
      return false
    })
}

async function deletePessoa(email) {
  await deleteUser(email)
    .then(async () => {
      await pool
        .query("DELETE FROM public.pessoa WHERE email = $1", [email])
        .then(() => {
          return true
        })
        .catch(() => {
          return false
        })
    })
    .catch(() => {
      return false
    })
}
