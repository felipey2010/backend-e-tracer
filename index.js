const express = require("express")
const app = express()
const cors = require("cors")
const routes = require("./src/routes")
require("dotenv").config()
const { Client } = require("pg")

//using this to define a particular directory
// const requireDir = require("require-dir")

//MIDDLEWARES
app.use(cors())
//Get JSON data from the database upon requests
app.use(express.json())

//folder to create our models
// requireDir("./src/models")
app.use("/api", routes)

//URL of the database
const PORT = Number(process.env.PORT) || 5000

const db_user = process.env.DB_USER
const db_port = process.env.DB_PORT

const db_password =
  process.env.DB_PRODUCTION === "true"
    ? process.env.DB_PASSWORD_PROD
    : process.env.DB_PASSWORD_LOCAL

const db_host =
  process.env.DB_PRODUCTION === "true"
    ? process.env.DB_HOST_PROD
    : process.env.DB_HOST_LOCAL

const db_name =
  process.env.DB_PRODUCTION === "true"
    ? process.env.DB_NAME_PROD
    : process.env.DB_NAME_LOCAL

//load database credentials
const client = new Client({
  user: db_user,
  password: db_password,
  host: db_host,
  port: db_port,
  database: db_name,
})

// async function connect() {
//   let connection_string =
//     "postgres://" +
//     db_user +
//     ":" +
//     db_password +
//     "@" +
//     db_host +
//     ":" +
//     db_port +
//     "/" +
//     db_name

//   try {
//     const client = new Client(connection_string)
//     await client.connect()
//     console.log("Connected to database successfully")
//   } catch (e) {
//     console.log(e)
//   }
// }

// connect()

//connect to database
// client.connect(function (err) {
//   if (err) console.log(err)

//   console.log("Connected to database successfully")
// })

//Start the server
app.listen(PORT, function (err) {
  if (err) console.log(err)

  console.log("Now listening for request at port: " + PORT)
})
