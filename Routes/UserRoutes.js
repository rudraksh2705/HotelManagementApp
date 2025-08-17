const express = require("express");
const UserController = require("../Controllers/UserController");

const Router = express.Router();

Router.route("/").get(UserController.getAllUsers);

module.exports = Router;
