const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * AUTH MIDDLEWARE
 * This function runs before the route handlers i.e ( app.get('/meow', ()=>{}); ).
 * This specific Middleware checks if the request has a valid JWT token. (a logger is another famous one)
**/
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Header format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'No token provided. Please login.' 
      });
    }
    
    // Extract token (remove "Bearer " prefix, check the HTTPS request header to see what I mean)
    const token = authHeader.split(' ')[1];
    
    // Verify token signature and decode payload
    // jwt.verify checks:
    //   Token hasn't been tampered with
    //   Token hasn't expired
    //   Token was signed with our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists in database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'User no longer exists' 
      });
    }
    
    // Add user info to request object
    // Now route handlers can access req.userId and req.user
    req.userId = decoded.userId;
    req.user = user;
    
    // Continue to route handler
    next();
    
  } catch (error) {
    console.error('Token verification error:', error);    
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Middleware that doesn't fail if no token
// Used for routes that work both for logged-in and public users
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user) {
        req.userId = decoded.userId;
        req.user = user;
      }
    }
    
    // Continue regardless of token validity
    next();
  } catch (error) {
    next();
  }
};

module.exports = { verifyToken, optionalAuth };