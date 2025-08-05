const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  movie_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movies",
    required: true
  },
  number_of_seats: {
    type: Number,
    required: true,
  },
  show_time: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  deleted_on: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

const Bookings = mongoose.model("Bookings", bookingSchema);
module.exports = Bookings