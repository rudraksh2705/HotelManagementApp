const app = require("./app");
const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/HotelApp")
  .then(() => console.log("Mongo DB Connected"));

const port = 8000;
app.listen(port, () => {
  console.log("Server Connected");
});
