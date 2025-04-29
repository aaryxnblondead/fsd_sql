import express from 'express';
import { body } from 'express-validator';
import { authenticateUser } from '../middleware/auth.js';
import { 
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createSystemNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications for the current user
// @access  Private
router.get('/', authenticateUser, getUserNotifications);

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Private
router.post(
  '/',
  [
    authenticateUser,
    [
      body('recipient', 'Recipient is required').notEmpty(),
      body('type', 'Type is required').notEmpty(),
      body('title', 'Title is required').notEmpty(),
      body('message', 'Message is required').notEmpty()
    ]
  ],
  createNotification
);

// @route   POST /api/notifications/system
// @desc    Create system notification for multiple users
// @access  Private (Admin or Teacher)
router.post(
  '/system',
  [
    authenticateUser,
    [
      body('recipients', 'Recipients array is required').isArray(),
      body('title', 'Title is required').notEmpty(),
      body('message', 'Message is required').notEmpty()
    ]
  ],
  createSystemNotification
);

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', authenticateUser, markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', authenticateUser, markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', authenticateUser, deleteNotification);

export default router; 