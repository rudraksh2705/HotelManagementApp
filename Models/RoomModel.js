const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  Baseprice: {
    required: true,
    type: Number,
    min: 1000,
  },

  occupancy: {
    type: Number,
    required: true,
    min: 1,
  },

  Booked: {
    type: Boolean,
    default: false,
  },

  BookedBy: {
    type: String,
    required: function () {
      return this.Booked === true;
    },
  },

  BookingDates: {
    type: [Date],
    required: function () {
      return this.Booked === true;
    },
  },

  Description: {
    type: String,
    required: true,
  },

  AverageRating: Number,

  reserved: {
    type: Boolean,
  },

  reservedReason: {
    type: String,
    required: function () {
      return this.reserved === true;
    },
  },

  RevenueGenerated: {
    type: [
      {
        amount: { type: Number, required: true },
        Date: { type: Date, required: true },
        amountPaid: { type: Number, required: true },
      },
    ],

    default: [],
  },

  Reviews: {
    type: [
      {
        rating: { type: Number, required: true },
        User: { type: String, required: true },
        Description: { type: String, required: true },
      },
    ],

    default: [],
  },
});

const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;
