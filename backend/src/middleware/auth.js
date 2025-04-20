import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token middleware
export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    console.log('Verifying token');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, user ID:', decoded.userId);
    
    // Find user by ID from decoded token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('User authenticated:', user.username);
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin authorization middleware
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    console.log('Admin authorization granted for user:', req.user.username);
    next();
  } else {
    console.log('Admin authorization denied for user:', req.user?.username);
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
}; 