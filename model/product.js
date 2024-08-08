const mongoose = require("mongoose");
const User = require("./user")
const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: { type: [String], required: false }, // Array of image URLs
  stock: { type: Number, required: true },
  datePosted: { type: Date, default: Date.now },
  location: { type: String, required: true },
  condition: {
    type: String,
    enum: ["new", "used"],
    default: "used"
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
