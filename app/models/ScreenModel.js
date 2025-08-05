const mongoose = require("mongoose");

const screenSchema = mongoose.Schema({
  theater_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Theaters",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  seats: {
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

const Screens = mongoose.model("Screens", screenSchema);
module.exports = Screens