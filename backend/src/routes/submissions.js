import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { 
  submitSolution, 
  getUserSubmissions, 
  getSubmission 
} from '../controllers/submissionController.js';

const router = express.Router();

// @route   POST /api/submissions
// @desc    Submit a solution for a challenge
// @access  Private
router.post('/', authenticateUser, submitSolution);

// @route   GET /api/submissions
// @desc    Get all submissions for the logged-in user
// @access  Private
router.get('/', authenticateUser, getUserSubmissions);

// @route   GET /api/submissions/:id
// @desc    Get a specific submission
// @access  Private
router.get('/:id', authenticateUser, getSubmission);

export default router; 