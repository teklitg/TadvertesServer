const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  campanyName: { type: String, required: false },
  fathersName: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false },
  password: { type: String, required: true },
  authToken: { type: String },
  isAuthenticated: { type: Boolean, default: false },
}, {
  validate: {
    validator: function() {
      return this.name || this.campanyName;
    },
    message: 'Either name or campanyName must be provided'
  }
});

// Pre-save hook to hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
