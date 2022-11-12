const express = require("express")
const routes = express.Router()
// const verify = require("./verifyToken");

routes.get("/", (req, res) => {
  res.send("URL Base da API")
})

const SystemControllers = require("./controllers/SystemSettings")
routes.get("/settings", SystemControllers.getInitialSettings)

//User Routes
const UserController = require("./controllers/UsersController")
// routes.get("/users", UserController.index)
routes.post("/account/person/register", UserController.register)
routes.get("/user/verifyEmail/:email", UserController.verifyEmail)
routes.post("/user/new-person", UserController.create_new_person)
routes.post("/user/get-user-info/", UserController.get_user_data)

//Authentication Routes
const AuthContoller = require("./controllers/AuthController")
routes.post("/auth/person/pre-login", AuthContoller.prelogin)
routes.post("/auth/person/login", AuthContoller.authenticate)
routes.post("/auth/person/logout", AuthContoller.logout)
routes.post("/auth/person/is-auth", AuthContoller.checkToken)
//Reset password
routes.post("/auth/person/forgot-password", AuthContoller.send_code_to_email)

//User operation Routes
const UserOperationController = require("./controllers/UserOperationController")
routes.post(
  "/user/notifications",
  UserOperationController.getNotificationsByUser
)
routes.post(
  "/user/notification",
  UserOperationController.createNotificationForUser
)

module.exports = routes
