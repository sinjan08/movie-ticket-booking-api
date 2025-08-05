const mongoose = require("mongoose");

const userRoleMapSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Roles",
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

const UserRoleMap = mongoose.model("UserRoleMap", userRoleMapSchema);
module.exports = UserRoleMap