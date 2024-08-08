const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  companyName: { type: String, required: false },
  fathersName: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false },
  password: { type: String, required: true },
  authToken: { type: String },
  isAuthenticated: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordTokenExpiry: { type: Date },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] // Add this line
}, {
  validate: {
    validator: function() {
      return this.name || this.companyName;
    },
    message: 'Either name or companyName must be provided'
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