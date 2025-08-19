const express = require("express");
const Router = express.Router();
const RoomController = require("../Controllers/RoomController");
const AuthController = require("../Controllers/authController");

Router.route("/")
  .get(
    AuthController.restrictTo,
    AuthController.protect,
    RoomController.getAllRooms
  )
  .post(
    AuthController.restrictTo,
    AuthController.protect,
    RoomController.CreateRooms
  );

Router.route("/:id")
  .delete(
    AuthController.restrictTo,
    AuthController.protect,
    RoomController.deleteRoom
  )
  .patch(
    AuthController.restrictTo,
    AuthController.protect,
    RoomController.UpdateField
  )
  .get(RoomController.getRoom);
module.exports = Router;
