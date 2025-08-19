const express = require("express");
const UserController = require("../Controllers/UserController");
const AuthController = require("../Controllers/authController");

const Router = express.Router();

Router.route("/forgetPassword").post(AuthController.forgetPassword);
Router.route("/resetPassword/:resetToken").post(AuthController.resetPassword);
Router.route("/updatePassword").post(AuthController.updatePassword);
Router.route("/deleteAccount").post(AuthController.deleteMe);

Router.route("/")
  .get(
    AuthController.protect,
    AuthController.restrictTo,
    UserController.getAllUsers
  )
  .post(
    AuthController.protect,
    AuthController.restrictTo,
    UserController.CreateUser
  );

Router.route("/:id")
  .patch(
    AuthController.protect,
    AuthController.restrictTo,
    UserController.UpdateField
  )
  .delete(
    AuthController.protect,
    AuthController.restrictTo,
    UserController.deleteUser
  )
  .get(AuthController.protect, UserController.getUser);

Router.route("/signup").post(AuthController.signup);
Router.route("/login").post(AuthController.login);

module.exports = Router;
