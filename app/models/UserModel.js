const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: false,
  },
  profile_image: {
    type: String,
    required: false,
  },
  is_verified: {
    type: Boolean,
    default: false,
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
    ref: "Users",
  }
}, {
  timestamps: true,
  versionKey: false
});

const Users = mongoose.model("Users", userSchema);
module.exports = Users