const { Router } = require("express")
const routes = Router()

routes.get("/", (req, res) => {
  res.send("URL Base da API")
})

const SystemController = require("./controllers/SystemSettings")
routes.get("/settings", SystemController.getInitialSettings)

//User Routes
const UserController = require("./controllers/UsersController")
// routes.get("/users", UserController.index)
routes.post("/account/person/register", UserController.register)
// routes.get("/user/verifyEmail/:email", UserController.verifyEmail)
// routes.post("/user/new-person", UserController.create_new_person)
// routes.post("/user/get-user-info/", UserController.get_user_data)

//Authentication Routes
const AuthController = require("./controllers/AuthController")
routes.post("/auth/person/pre-login", AuthController.prelogin)
routes.post("/auth/person/login", AuthController.authenticate)
routes.post("/auth/person/logout", AuthController.logout)
routes.post("/auth/person/is-auth", AuthController.checkToken)
//Reset password
routes.post("/auth/person/forgot-password", AuthController.send_code_to_email)
routes.post(
  "/auth/person/forgot-password/verify",
  AuthController.verify_password_reset_code
)
routes.post("/auth/person/reset_password", AuthController.reset_password)

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

const RoomController = require("./controllers/RoomController")
routes.post("/rooms", RoomController.get_rooms)
routes.post("/rooms/create", RoomController.register)
routes.post("/rooms/update", RoomController.update)
routes.post("/rooms/delete", RoomController.delete)

module.exports = routes
