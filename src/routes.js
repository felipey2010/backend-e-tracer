const express = require("express")
const routes = express.Router()
// const verify = require("./verifyToken");

routes.get("/", (req, res) => {
  res.send("URL Base da API")
})

const UserController = require("./controllers/UsersController")
//User Routes
routes.get("/users", UserController.index)
routes.post("/account/person/register", UserController.register)
routes.get("/user/verifyEmail/:email", UserController.verifyEmail)
routes.post("/user/new-person", UserController.create_new_person)
routes.post("/user/get-user-info/", UserController.get_user_data)

const AuthController = require("./controllers/AuthController")
routes.post("/auth/person/pre-login", AuthController.prelogin)
routes.post("/auth/person/login", AuthController.authenticate)
routes.post("/auth/person/logout", AuthController.logout)
routes.post("/auth/person/is-auth", AuthController.checkToken)

const TimeController = require("./controllers/TimeController")
routes.get("/greeting", TimeController.greeting)

module.exports = routes
