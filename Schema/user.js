const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  client_id: { type: String, default: null },  // Optional field for client ID
  security_key: { type: String, default: null } // Optional field for security key
});

// Create user model
const User = mongoose.model("User", userSchema);

module.exports = User;
