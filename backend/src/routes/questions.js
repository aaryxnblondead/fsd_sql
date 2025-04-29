import express from 'express';
import { body } from 'express-validator';
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  addAnswer,
  acceptAnswer,
  deleteQuestion
} from '../controllers/questionController.js';
import { authenticateUser } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

// @route   GET /api/questions
// @desc    Get all questions with filters
router.get('/', getAllQuestions);

// @route   GET /api/questions/:id
// @desc    Get a question by ID
router.get('/:id', getQuestionById);

// @route   POST /api/questions
// @desc    Create a new question
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required')
      .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('content').notEmpty().withMessage('Content is required')
      .isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
    body('category').isIn(['sql-basics', 'joins', 'subqueries', 'aggregation', 'advanced', 'other'])
      .withMessage('Invalid category'),
    body('targetTeacher').optional().isMongoId().withMessage('Invalid teacher ID'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean'),
    validateRequest
  ],
  createQuestion
);

// @route   PUT /api/questions/:id
// @desc    Update a question
router.put(
  '/:id',
  [
    body('title').optional().isLength({ min: 5, max: 200 })
      .withMessage('Title must be between 5 and 200 characters'),
    body('content').optional().isLength({ min: 10 })
      .withMessage('Content must be at least 10 characters'),
    body('category').optional()
      .isIn(['sql-basics', 'joins', 'subqueries', 'aggregation', 'advanced', 'other'])
      .withMessage('Invalid category'),
    body('targetTeacher').optional().isMongoId().withMessage('Invalid teacher ID'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean'),
    validateRequest
  ],
  updateQuestion
);

// @route   POST /api/questions/:id/answers
// @desc    Add an answer to a question
router.post(
  '/:id/answers',
  [
    body('content').notEmpty().withMessage('Answer content is required')
      .isLength({ min: 10 }).withMessage('Answer must be at least 10 characters'),
    validateRequest
  ],
  addAnswer
);

// @route   PUT /api/questions/:id/answers/:answerId/accept
// @desc    Mark an answer as accepted
router.put('/:id/answers/:answerId/accept', acceptAnswer);

// @route   DELETE /api/questions/:id
// @desc    Delete a question
router.delete('/:id', deleteQuestion);

export default router; 