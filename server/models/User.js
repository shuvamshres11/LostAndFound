const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  phone: { type: String, default: "" },
  bio: { type: String, default: "" },
  profilePicture: { type: String, default: "" } // Base64 string or URL
});

module.exports = mongoose.model('User', userSchema);