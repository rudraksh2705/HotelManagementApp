const User = require("../Models/UserModel");
const catchAsync = require("../Utils/catchAsync");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const secret = process.env.jwt_secret;

const changePassword = function (JWTTimeStamp, currentUser) {
  if (currentUser.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

exports.signup = catchAsync(async (req, res) => {
  const { username, name, password, passwordConfirm, email } = req.body;
  const data = await User.create({
    username,
    name,
    password,
    passwordConfirm,
    email,
  });

  const token = jwt.sign({ id: data._id }, secret);
  console.log(token);

  res.status(201).json({
    status: "success",
    token,
  });
});

exports.login = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(401).json({
      status: "Fail",
      message: "Please provide both username and password.",
    });
  }
  const user = await User.findOne({ username }).select("+password");
  console.log(user);

  if (!user || !(await user.check(password))) {
    return res.status(401).json({
      status: "fail",
      message: "Incorrect username or password.",
    });
  }

  const token = jwt.sign({ id: user._id }, secret);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  console.log("Entered");
  let token = "";

  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }

  if (!req.headers.authorization || !token) {
    res.status(401).json({
      status: "error",
      message: "You are not logged in !",
    });
  }

  try {
    const decoded = await promisify(jwt.verify)(token, secret);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new Error("The user belonging to this token no longer exists.");
    }
    console.log(decoded.iat);
    if (currentUser.changePassword(token.iat, currentUser)) {
      throw new Error("You recently changed your password , login again");
    }
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({
      status: "fail",
      message: err,
    });
  }
});
