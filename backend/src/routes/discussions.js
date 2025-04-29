import express from 'express';
import { body } from 'express-validator';
import { authenticateUser } from '../middleware/auth.js';
import { 
  getAllDiscussions,
  getDiscussionById,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  addComment,
  markAsAnswer,
  toggleLikeDiscussion,
  toggleLikeComment
} from '../controllers/discussionController.js';

const router = express.Router();

// @route   GET /api/discussions
// @desc    Get all discussions with pagination and filters
// @access  Public
router.get('/', getAllDiscussions);

// @route   GET /api/discussions/:id
// @desc    Get discussion by ID
// @access  Public
router.get('/:id', getDiscussionById);

// @route   POST /api/discussions
// @desc    Create a new discussion
// @access  Private
router.post(
  '/',
  [
    authenticateUser,
    [
      body('title', 'Title is required').notEmpty(),
      body('content', 'Content is required').notEmpty()
    ]
  ],
  createDiscussion
);

// @route   PUT /api/discussions/:id
// @desc    Update discussion
// @access  Private (owner only)
router.put(
  '/:id',
  [
    authenticateUser,
    [
      body('title', 'Title is required').optional().notEmpty(),
      body('content', 'Content is required').optional().notEmpty()
    ]
  ],
  updateDiscussion
);

// @route   DELETE /api/discussions/:id
// @desc    Delete discussion
// @access  Private (owner or admin)
router.delete('/:id', authenticateUser, deleteDiscussion);

// @route   POST /api/discussions/:id/comments
// @desc    Add comment to discussion
// @access  Private
router.post(
  '/:id/comments',
  [
    authenticateUser,
    [
      body('content', 'Content is required').notEmpty()
    ]
  ],
  addComment
);

// @route   PUT /api/discussions/:id/comments/:commentId/answer
// @desc    Mark comment as answer
// @access  Private (discussion owner only)
router.put('/:id/comments/:commentId/answer', authenticateUser, markAsAnswer);

// @route   PUT /api/discussions/:id/like
// @desc    Like/unlike a discussion
// @access  Private
router.put('/:id/like', authenticateUser, toggleLikeDiscussion);

// @route   PUT /api/discussions/:id/comments/:commentId/like
// @desc    Like/unlike a comment
// @access  Private
router.put('/:id/comments/:commentId/like', authenticateUser, toggleLikeComment);

export default router; 