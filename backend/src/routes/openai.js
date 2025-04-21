import express from 'express';
import { generateSQLFeedback, testSQLFeedback } from '../controllers/openaiController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/openai/sql-feedback
 * @desc    Generate feedback for SQL queries using OpenAI
 * @access  Private
 */
router.post('/sql-feedback', authenticateUser, generateSQLFeedback);

/**
 * @route   POST /api/openai/test-sql-feedback
 * @desc    Test endpoint for SQL feedback (no authentication required)
 * @access  Public
 */
router.post('/test-sql-feedback', testSQLFeedback);

export default router; 