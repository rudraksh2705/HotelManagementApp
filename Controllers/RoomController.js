const User = require("../Models/RoomModel");
const catchAsync = require("../Utils/catchAsync");

class Features {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    let obj = { ...this.queryObj };
    const excludedFields = ["page", "sort", "limit"];
    excludedFields.forEach((el) => delete obj[el]);

    let queryStr = JSON.stringify(obj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      this.query = this.query.sort(this.queryObj.sort.split(",").join(" "));
    } else {
      this.query = this.query.sort("Baseprice");
    }
    return this;
  }

  pagination() {
    const page = this.queryObj.page * 1 || 1;
    const limit = this.queryObj.limit * 1 || 5;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

exports.getAllRooms = catchAsync(async (req, res) => {
  const features = new Features(User.find(), req.query)
    .filter()
    .sort()
    .pagination();

  const data = await features.query;

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
