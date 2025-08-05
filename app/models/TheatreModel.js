const mongoose = require("mongoose");

const theaterSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
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
})

const Theaters = mongoose.model("theatres", theaterSchema);
module.exports = Theaters