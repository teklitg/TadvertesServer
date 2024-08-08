const express = require('express');
const productRouter = express.Router();
const Product = require("../model/product")
const User = require('../model/user'); // Assuming user model is in models/user.js

// Endpoint to post a produc
productRouter.post('/products', async (req, res) => {
  const { title, description, price, category, images, stock, location, condition, sellerId } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(sellerId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new product
    const product = new Product({
      seller: sellerId,
      title,
      description,
      price,
      category,
      images,
      stock,
      location,
      condition
    });

    // Save the product
    await product.save();

    // Add the product to the user's products array
    await User.findByIdAndUpdate(sellerId, {
      $push: { products: product._id }
    });

    // Return the created product
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

productRouter.get('/products', async (req, res) => {
    try {
      const products = await Product.find().populate('seller', 'name email'); // Populate seller with specific fields
      res.status(200).json(products);
   
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Endpoint to get a single product by ID
productRouter.get('/products/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const product = await Product.findById(id).populate('seller', 'name email');
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

productRouter.delete("/products/:id", async (req, res) => {
  const {id} = req.params;

  try {

    const product = await Product.findById(id).populate('seller')

    res.status(200).json(product)

  } catch (error) {
     res.json({delete : "failed"})
  }
})

module.exports = productRouter;
