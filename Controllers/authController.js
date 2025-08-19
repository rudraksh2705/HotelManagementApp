const { validate } = require("../Models/RoomModel");
const User = require("../Models/UserModel");
const AppError = require("../Utils/AppError");
const catchAsync = require("../Utils/catchAsync");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const bcrypt = require("bcryptjs");

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
    return next(new AppError("You are not logged in !", 401));
  }

  try {
    const decoded = await promisify(jwt.verify)(token, secret);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new Error("The user belonging to this token no longer exists.");
    }
    console.log(decoded.iat);
    if (changePassword(token.iat, currentUser)) {
      throw new Error("You recently changed your password , login again");
    }
    next();
  } catch (err) {
    return next(new AppError(err.message, 401));
  }
});

exports.restrictTo = catchAsync(async (req, res, next) => {
  console.log("Entered");
  let token = "";
  if (
    req.headers.authorization &&
    req.headers.authorization.includes("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(token);
  if (!token) {
    return next(new AppError("User is currently not logged in", 401));
  }

  try {
    const decoded = await promisify(jwt.verify)(token, secret);
    const user = await User.findById(decoded.id);
    console.log(user);
    if (user.role === "Admin") next();
    else throw new Error("You can't access this service");
  } catch (err) {
    res.status(401).json({
      status: "error",
      message: err.message,
    });
  }
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError("Email is required", 401));
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(`User not found with mail id ${req.body.email} `, 401)
    );
  }

  user.save({ validateBeforeSave: false });

  const resetToken = user.createResetToken();

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}\nIf you didn't forget your password, please ignore this email!`;

  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
    resetToken,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.resetToken;
  const user = await User.findOne({ passwordResetToken: resetToken });

  if (!user || user.passwordResetTokenExpires < Date.now()) {
    return next(new AppError("You reset Token has expired", 401));
  }

  console.log(user);
  if (!req.body.newPassword) {
    return next(new AppError("New Password not given", 401));
  }
  if (req.body.newPassword) {
    user.password = await bcrypt.hash(req.body.newPassword, 10);
    await user.save({ validateBeforeSave: false });
    res.status(201).json({
      status: "success",
      message: "Password Updated Successfuly",
      Hashedpassword: user.password,
    });
  }
});

//User is currently logged in
exports.updatePassword = catchAsync(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.includes("Bearer")
  ) {
    return next(new AppError("User is currently not logged in", 401));
  }

  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = await promisify(jwt.verify)(token, secret);
    const user = await User.findById(decoded.id).select("+password");
    if (!req.body.password) {
      throw new Error("Password is not given");
    }

    const correct = await bcrypt.compare(req.body.password, user.password);
    if (!correct) {
      throw new Error("Password is incorrect");
    } else {
      user.password = await bcrypt.hash(req.body.newPassword, 10);
      await user.save({ validateBeforeSave: false });

      res.status(201).json({
        status: "success",
        message: "password Changed Successfully",
        password: user.password,
      });
    }
  } catch (err) {
    res.status(401).json({
      status: "error",
      message: err.message,
    });
  }
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.includes("header")
  ) {
    return next(new AppError("You are not logged in", 401));
  }

  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for updating password", 401));
  }

  const decoded = await promisify(json.verify)(token, secret);
  const user = await User.findById(decoded.id);

  user[req.body.field] = req.body.value;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Data updated",
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.includes("Bearer")
  ) {
    return next(new AppError("You are not logged in ", 401));
  }
  let user = "";
  const token = req.headers.authorization.split(" ")[1];
  const decoded = await promisify(jwt.verify)(token, secret);
  user = await User.findById(decoded.id).select("+active");
  user.active = false;
  await user.save();

  res.status(201).json({
    status: "success",
    message: "deleted",
  });
});
