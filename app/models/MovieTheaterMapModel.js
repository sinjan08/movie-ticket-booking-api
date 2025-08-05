const mongoose = require("mongoose");

const movieTheaterMapSchema = mongoose.Schema({
  movie_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movies",
    required: true
  },
  theater_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Theaters",
    required: true
  },
  show_time: [
    {
      screen_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Screens",
        required: true
      },
      start_time: {
        type: Date,
        required: true
      },
      end_time: {
        type: Date,
        required: true
      }
    }
  ],
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

const MovieTheaterMap = mongoose.model("MovieTheaterMap", movieTheaterMapSchema);
module.exports = MovieTheaterMap