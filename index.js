const express = require("express")
const app = express()
const cors = require("cors")
const routes = require("./src/routes")
require("dotenv").config()
const { Client } = require("pg")

//using this to define a particular directory
const requireDir = require("require-dir")

//MIDDLEWARES
app.use(cors())
//Get JSON data from the database upon requests
app.use(express.json())

//folder to create our models
requireDir("./src/models")
app.use("/api", routes)

//URL of the database
const PORT = Number(process.env.PORT) || 5000

//load database credentials
const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
})

//connect to database
client.connect(function (err) {
  if (err) console.log(err)

  console.log("Connected to database successfully")
})

//Test the connection

//Start the server
app.listen(PORT, function (err) {
  if (err) console.log(err)

  console.log("Now listening for request at port: " + PORT)
})
