const express = require("express");
const UserController = require("../Controllers/UserController");
const AuthController = require("../Controllers/authController");

const Router = express.Router();

Router.route("/")
  .get(AuthController.protect, UserController.getAllUsers)
  .post(UserController.CreateUser);

Router.route("/:id")
  .patch(UserController.UpdateField)
  .delete(UserController.deleteUser)
  .get(UserController.getUser);

Router.route("/signup").post(AuthController.signup);
Router.route("/login").post(AuthController.login);

module.exports = Router;
