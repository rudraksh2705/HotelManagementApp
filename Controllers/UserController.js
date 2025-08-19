const User = require("../Models/UserModel");
const catchAsync = require("../Utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res) => {
  const data = await User.find();
  res.status(201).json({
    status: "success",
    data,
  });
});

exports.CreateUser = catchAsync(async (req, res) => {
  await User.create(req.body);
  res.status(201).json({
    status: "success",
    message: "Data added",
  });
});

exports.deleteUser = catchAsync(async (req, res) => {
  const id = req.params.id;
  console.log(id);
  await User.deleteOne({ _id: id });
  res.status(204).json({
    status: "success",
  });
});

exports.getUser = catchAsync(async (req, res) => {
  const id = req.params.id;
  const user = await User.findOne({ _id: id });
  res.status(201).json({
    status: "success",
    user,
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
