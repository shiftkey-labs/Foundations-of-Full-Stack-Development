const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const generateToken = (userId) => {
  return jwt.sign(
    { userId }, // the thing you store in the token (id, email, username, etc.)
    process.env.JWT_SECRET, // Secret key
    { expiresIn: '7d' } // Expiration time
  );
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide username, email, and password' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] // Check both email AND username
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }
    
    // Password will be hashed automatically by pre-save hook
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    
    // Generate JWT token using the user's id
    const token = generateToken(user._id);
    
    // Return token and user info
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Error creating user' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Return token and user info
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// GET /api/auth/me
// Get current user info (requires authentication)
router.get('/me', async (req, res) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// PUT /api/auth/me/username
// Update logged-in user's username
router.put('/me/username', verifyToken, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const normalized = username.trim();

    if (normalized.length < 3 || normalized.length > 30) {
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
    }

    const existingUser = await User.findOne({
      username: normalized,
      _id: { $ne: req.userId }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = normalized;
    await user.save();

    res.json({
      message: 'Username updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Update username error:', error);
    res.status(500).json({ message: 'Error updating username' });
  }
});

module.exports = router;