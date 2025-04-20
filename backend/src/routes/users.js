import express from 'express';
import { authenticateUser, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateUser, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      progress: req.user.progress
    }
  });
});

// @route   GET /api/users/progress
// @desc    Get user progress
// @access  Private
router.get('/progress', authenticateUser, (req, res) => {
  res.json({
    progress: req.user.progress
  });
});

// Routes below are placeholders for future implementation

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', [authenticateUser, authorizeAdmin], (req, res) => {
  res.json({ message: 'List of all users - To be implemented' });
});

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/:id', [authenticateUser, authorizeAdmin], (req, res) => {
  res.json({ message: 'User details - To be implemented' });
});

export default router; 