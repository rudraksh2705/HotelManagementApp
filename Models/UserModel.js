const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "This is not a valid email"],
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 20,
    select: false,
  },

  passwordConfirm: {
    type: String,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password does not match",
    },
  },

  name: {
    required: true,
    type: String,
    minlength: 5,
  },

  username: {
    unique: true,
    type: String,
    required: true,
  },

  history: {
    type: [
      {
        Date: { type: Date, required: true },
        noOfdays: { type: Number, required: true },
        room_id: { type: String, required: true },
      },
    ],
    default: [],
  },

  role: {
    type: String,
    enum: ["Customer", "Admin"],
    default: "Customer",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  reviews: [
    {
      room_id: { type: String, required: true },
      description: { type: String, required: true },
      rating: { type: Number, required: true },
    },
  ],

  passwordResetToken: String,

  passwordResetTokenExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;
  next();
});

UserSchema.methods.check = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.changePassword = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

UserSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

UserSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10000 * 60 * 1000;
  return this.passwordResetToken;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
