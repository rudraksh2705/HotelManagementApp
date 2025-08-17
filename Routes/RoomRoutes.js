const express = require("express");
const Router = express.Router();
const RoomController = require("../Controllers/RoomController");

Router.route("/").get(RoomController.getAllRooms);

module.exports = Router;
