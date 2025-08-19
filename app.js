require("dotenv").config({ path: "./config.env" });
const express = require("express");
const morgan = require("morgan");
const UserRoutes = require("./Routes/UserRoutes");
const RoomRoutes = require("./Routes/RoomRoutes");

const app = express();

app.use(express.json());

app.use(morgan("dev"));

app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/rooms", RoomRoutes);

// app.all("*", (req, res, next) => {
//   res.status(404).json({
//     message: "Route Not Found",
//   });
// });

app.use((err, req, res, next) => {
  console.log("entered");
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
