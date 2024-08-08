const path = require("path")
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const userRoute = require("express").Router()
const User = require("../model/user")
const nodemailer = require('nodemailer');
const {SECRET_KEY} = require("../utility/utility");

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


userRoute.get('/create', async (req, res) => {
  try {
    // Fetch all users and populate their products
    const users = await User.find({}).populate('products');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

userRoute.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('products');
    if (!user) return res.sendStatus(404);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
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

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already exists' });
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
        // If user does not exist, return unauthorized response
        return res.status(401).json({ isAuthenticated: false, message: 'Invalid email or password' });
      }
  
      // Check if the user's account is active (email verified)
      if (!user.isAuthenticated) {
        // If user account is not active, return unauthorized response with specific message
        return res.status(403).json({ isAuthenticated: false, message: 'Account not active. Please check your email for the verification link.' });
      }
  
      // Verify password using bcrypt.compare
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        // If passwords do not match, return unauthorized response
        return res.status(401).json({ isAuthenticated: false, message: 'Invalid email or password' });
      }
  
      // If authentication is successful, generate JWT token
      const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.SECRET_KEY);
      
      // Return success response with token
      return res.json({ isAuthenticated: true, token, name: user.name });
      
    } catch (err) {
      // Handle server errors
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  });

  userRoute.post('/resend-verification', async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (user.isAuthenticated) {
        return res.status(400).json({ error: 'Account already verified' });
      }
  
      const mailOptions = {
        from: 'teklit99999@gmail.com',
        to: email,
        subject: 'Resend Email Verification',
        text: `Dear ${user.name || user.companyName} ${user.fathersName},\n\nPlease click the link below to verify your email address:\n\nhttp://localhost:3000/api/verify/${user.authToken}\n\nBest regards,\nCEO international`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Failed to send email:', error);
          return res.status(500).json({ error: 'Failed to send email' });
        } else {
          console.log('Email sent:', info.response);
          res.status(200).json({ message: 'Verification email has been resent. Please check your email.' });
        }
      });
    } catch (error) {
      console.error('Error resending verification email:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

userRoute.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send email with the reset token
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`; // Adjust URL as needed

    await transporter.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetUrl}">Reset Password</a>
             <p>This link will expire in 1 hour.</p>`,
    });

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

userRoute.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
 // this may not be use full
userRoute.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token
    })  

    if(!user){
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = userRoute