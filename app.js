const express = require("express");
const morgan = require("morgan");
const UserRoutes = require("./Routes/UserRoutes");
const RoomRoutes = require("./Routes/RoomRoutes");

const app = express();

app.use(express.json());

app.use(morgan("dev"));

app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/rooms", RoomRoutes);

module.exports = app;
