const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  genre: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true
  },
  cast: [
    {
      name: { type: String, required: true },
      role: { type: String, required: true }
    }
  ],
  director: {
    type: String,
    required: true
  },
  release_date: {
    type: Date,
    required: true
  },
  poster: {
    type: String,
    required: false
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  deleted_on: {
    type: Date,
    default: null,
  },
  deleted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
}, {
  timestamps: true,
  versionKey: false
});

const Movies = mongoose.model("Movies", movieSchema);
module.exports = Movies;
