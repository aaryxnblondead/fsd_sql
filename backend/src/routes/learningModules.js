import express from 'express';
import { body } from 'express-validator';
import { authenticateUser } from '../middleware/auth.js';
import { 
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  updateLessonProgress,
  getUserProgress
} from '../controllers/learningModuleController.js';

const router = express.Router();

// @route   GET /api/learning-modules
// @desc    Get all learning modules
// @access  Public
router.get('/', getAllModules);

// @route   GET /api/learning-modules/:id
// @desc    Get module by ID
// @access  Public (progress tracking requires authentication)
router.get('/:id', getModuleById);

// @route   POST /api/learning-modules
// @desc    Create a new learning module
// @access  Private (Admin or Teacher)
router.post(
  '/',
  [
    authenticateUser,
    [
      body('title', 'Title is required').notEmpty(),
      body('description', 'Description is required').notEmpty(),
      body('category', 'Category is required').notEmpty(),
      body('difficulty', 'Difficulty is required').notEmpty()
    ]
  ],
  createModule
);

// @route   PUT /api/learning-modules/:id
// @desc    Update a learning module
// @access  Private (Admin or Creator)
router.put('/:id', authenticateUser, updateModule);

// @route   DELETE /api/learning-modules/:id
// @desc    Delete a learning module
// @access  Private (Admin or Creator)
router.delete('/:id', authenticateUser, deleteModule);

// @route   PUT /api/learning-modules/:moduleId/lessons/:lessonId/progress
// @desc    Update lesson progress
// @access  Private
router.put(
  '/:moduleId/lessons/:lessonId/progress',
  authenticateUser,
  updateLessonProgress
);

// @route   GET /api/learning-modules/user/progress
// @desc    Get user's learning progress
// @access  Private
router.get('/user/progress', authenticateUser, getUserProgress);

export default router; 