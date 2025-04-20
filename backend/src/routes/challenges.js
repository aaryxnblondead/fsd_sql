import express from 'express';
import { body } from 'express-validator';
import { authenticateUser, authorizeAdmin } from '../middleware/auth.js';
import { 
  getAllChallenges, 
  getChallengeById, 
  createChallenge, 
  updateChallenge, 
  deleteChallenge 
} from '../controllers/challengeController.js';

const router = express.Router();

// @route   GET /api/challenges
// @desc    Get all challenges
// @access  Public
router.get('/', getAllChallenges);

// @route   GET /api/challenges/:id
// @desc    Get challenge by ID
// @access  Public
router.get('/:id', getChallengeById);

// @route   POST /api/challenges
// @desc    Create a new challenge
// @access  Private/Admin
router.post(
  '/',
  [
    authenticateUser,
    authorizeAdmin,
    [
      body('title', 'Title is required').notEmpty(),
      body('description', 'Description is required').notEmpty(),
      body('difficulty', 'Difficulty must be easy, medium, or hard')
        .isIn(['easy', 'medium', 'hard']),
      body('category', 'Category is required').notEmpty(),
      body('databaseFile', 'Database file is required').notEmpty(),
      body('schema', 'Schema is required').notEmpty(),
      body('order', 'Order is required').isNumeric()
    ]
  ],
  createChallenge
);

// @route   PUT /api/challenges/:id
// @desc    Update a challenge
// @access  Private/Admin
router.put(
  '/:id',
  [
    authenticateUser,
    authorizeAdmin,
    [
      body('title', 'Title is required').optional().notEmpty(),
      body('description', 'Description is required').optional().notEmpty(),
      body('difficulty', 'Difficulty must be easy, medium, or hard')
        .optional()
        .isIn(['easy', 'medium', 'hard']),
      body('category', 'Category is required').optional().notEmpty(),
      body('order', 'Order must be a number').optional().isNumeric()
    ]
  ],
  updateChallenge
);

// @route   DELETE /api/challenges/:id
// @desc    Delete a challenge
// @access  Private/Admin
router.delete('/:id', [authenticateUser, authorizeAdmin], deleteChallenge);

export default router; 