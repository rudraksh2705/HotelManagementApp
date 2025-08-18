const User = require("../Models/RoomModel");
const catchAsync = require("../Utils/catchAsync");

exports.getAllRooms = catchAsync(async (req, res) => {
  const data = await User.find();
  res.status(201).json({
    status: "success",
    data,
  });
});

exports.CreateRooms = catchAsync(async (req, res) => {
  const newdata = await User.create(req.body);
  res.status(200).json({
    status: "success",
    data: newdata,
  });
});

exports.deleteRoom = catchAsync(async (req, res) => {
  const id = req.params.id;
  console.log(id);
  await User.deleteOne({ _id: id });
  res.status(204).json({
    status: "success",
  });
});

exports.UpdateField = catchAsync(async (req, res) => {
  const id = req.params.id;
  const user = await User.findOne({ _id: id });
  const field = req.body.field;
  const value = req.body.value;
  user[field] = value;
  await user.save();
  res.status(201).json({
    status: "success",
    user,
  });
});

exports.getRoom = catchAsync(async (req, res) => {
  const id = req.params.id;
  const user = await User.findOne({ _id: id });
  res.status(201).json({
    status: "success",
    user,
  });
});
