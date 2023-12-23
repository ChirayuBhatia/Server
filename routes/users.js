const mongoose = require("mongoose");
const plm = require("passport-local-mongoose")

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
})


userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);