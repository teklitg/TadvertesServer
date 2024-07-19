const path = require("path")
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const userRoute = require("express").Router()
const User = require("../model/user")
const nodemailer = require('nodemailer');
const {SECRET_KEY} = require("../utility/utility");


userRoute.get('/create', async (req, res) => {
    const users = await User.find({});
    res.json(users);
  });


  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'teklit99999@gmail.com', // replace with your email
      pass: 'jico fazx dhhh rlhk', // Replace with your email's actual password or app-specific password
    },
  });
  
// Example of enhanced error handling in your backend route
userRoute.post('/create', async (req, res) => {
  const { name, companyName, fathersName, email, phone, password, birthDate } = req.body;

  // Check if either name or companyName is provided
  if (!name && !companyName) {
    return res.status(400).json({ error: 'Either name or companyName must be provided' });
  }

  const authToken = crypto.randomBytes(32).toString('hex');

  const newUser = new User({
    name,
    companyName,
    fathersName,
    email,
    phone,
    password,
    birthDate,
    authToken,
    isAuthenticated: false,
  });

  try {
    await newUser.save();
    console.log('User saved:', newUser);

    const mailOptions = {
      from: 'teklit99999@gmail.com',
      to: email,
      subject: 'Account Created Successfully',
      text: `Dear ${name || companyName} ${fathersName},\n\nYour account has been created successfully. Please click the link below to verify your email address:\n\nhttp://localhost:3000/api/verify/${authToken}\n\nBest regards,\nCEO international`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Failed to send email:', error);
        return res.status(500).json({ error: 'Failed to send email' });
      } else {
        console.log('Email sent:', info.response);
        res.status(201).json({ message: 'User created successfully and email sent' });
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: error.message });
  }
});


userRoute.get('/verify/:authToken', async (req, res) => {
    const { authToken } = req.params;
  
    try {
      const user = await User.findOne({ authToken });
  
      if (!user) {
        return res.status(400).json({ error: 'Invalid token' });
      }
  
      user.isAuthenticated = true;
      user.authToken = null;
      await user.save();
  
      res.sendFile(path.join(__dirname, 'public', 'success.html'))
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  userRoute.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
        // Check if user with the provided email exists
        const user = await User.findOne({ email });

        if (!user) {
            // If user does not exist, return error response
            return res.status(400).json({ isAuthenticated: false, message: 'Invalid email or password' });
        }
  
        // Verify password using bcrypt.compare
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // If passwords do not match, return error response
            return res.status(400).json({ isAuthenticated: false, message: 'Invalid email or password' });
        }
      
        // If authentication is successful, generate JWT token
        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
        
        // Return success response with token
        return res.json({ isAuthenticated: true, token });
        
    } catch (err) {
        // Handle server errors
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = userRoute