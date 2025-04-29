import express from 'express';
import { authenticateUser, authorizeAdmin, authorizeRole } from '../middleware/auth.js';
import User from '../models/User.js';

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

// Add this route to get students for a teacher
router.get('/students', [authenticateUser, authorizeRole('teacher')], async (req, res) => {
  try {
    // Get the current teacher's ID
    const teacherId = req.user.id;
    
    // Find all students associated with this teacher
    const students = await User.find(
      // Filter criteria - either directly associated with teacher
      // or no teacher association yet (for demo)
      { $or: [{ teachers: teacherId }, { role: 'user' }] },
      // Exclude password field
      { password: 0 }
    );
    
    res.json({ 
      success: true, 
      students 
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching students' 
    });
  }
});

export default router; 