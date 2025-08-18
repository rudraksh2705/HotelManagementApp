const express = require("express");
const Router = express.Router();
const RoomController = require("../Controllers/RoomController");

Router.route("/")
  .get(RoomController.getAllRooms)
  .post(RoomController.CreateRooms);

Router.route("/:id")
  .delete(RoomController.deleteRoom)
  .patch(RoomController.UpdateField)
  .get(RoomController.getRoom);
module.exports = Router;
