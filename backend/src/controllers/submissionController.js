import Submission from '../models/Submission.js';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import { executeSqlQuery } from '../services/sqlService.js';
import { generateAiFeedback } from '../services/openaiService.js';

// Submit a solution for a challenge
export const submitSolution = async (req, res) => {
  const { challengeId, code } = req.body;
  
  if (!challengeId || !code) {
    return res.status(400).json({ message: 'Challenge ID and code are required' });
  }
  
  try {
    // Find the challenge
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Execute the SQL query
    const startTime = Date.now();
    const queryResult = await executeSqlQuery(code, challenge.databaseFile);
    const executionTime = Date.now() - startTime;
    
    // Prepare submission data
    const submissionData = {
      user: req.user.id,
      challenge: challengeId,
      code,
      result: {
        success: !queryResult.error,
        output: queryResult.error ? null : JSON.stringify(queryResult.results),
        executionTime,
        error: queryResult.error
      }
    };
    
    // Check submission against test cases if query execution was successful
    if (!queryResult.error) {
      // Get the expected output from the visible test case
      const visibleTestCase = challenge.testCases.find(test => !test.isHidden);
      if (visibleTestCase) {
        submissionData.result.expectedOutput = visibleTestCase.expectedOutput;
        
        // Compare results (simplistic comparison, should be improved for real-world scenario)
        const isCorrect = JSON.stringify(queryResult.results) === visibleTestCase.expectedOutput;
        submissionData.isCorrect = isCorrect;
        
        // If incorrect and OpenAI integration is enabled, generate AI feedback
        if (!isCorrect) {
          try {
            const aiStartTime = Date.now();
            const feedback = await generateAiFeedback(
              code,
              queryResult.results,
              JSON.parse(visibleTestCase.expectedOutput),
              challenge.schema
            );
            submissionData.feedback = {
              aiGeneratedFeedback: feedback,
              feedbackGenerationTime: Date.now() - aiStartTime
            };
          } catch (aiError) {
            console.error('AI feedback generation error:', aiError.message);
            // Continue even if AI feedback fails
          }
        }
      }
    }
    
    // Create and save the submission
    const submission = new Submission(submissionData);
    await submission.save();
    
    // If the solution is correct and this is the first correct submission,
    // update user progress (add XP and mark challenge as completed)
    if (submissionData.isCorrect) {
      const existingCorrectSubmission = await Submission.findOne({
        user: req.user.id,
        challenge: challengeId,
        isCorrect: true
      });
      
      if (!existingCorrectSubmission) {
        // Update user's XP and add challenge to completed list
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { 'progress.xp': challenge.reward.xp },
          $addToSet: { 'progress.completedChallenges': challengeId }
        });
      }
    }
    
    // Find existing attempts count
    const existingAttempts = await Submission.countDocuments({
      user: req.user.id,
      challenge: challengeId
    });
    
    // Update submission with attempts count
    submission.attempts = existingAttempts;
    await submission.save();
    
    res.json(submission);
  } catch (error) {
    console.error('Submission error:', error.message);
    res.status(500).json({ message: 'Server error processing your submission' });
  }
};

// Get submissions for a user
export const getUserSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter by challenge if provided
    const filter = { user: req.user.id };
    if (req.query.challengeId) filter.challenge = req.query.challengeId;
    
    // Get total count
    const total = await Submission.countDocuments(filter);
    
    // Get submissions
    const submissions = await Submission.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('challenge', 'title difficulty category');
    
    res.json({
      submissions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error.message);
    res.status(500).json({ message: 'Server error retrieving submissions' });
  }
};

// Get a specific submission
export const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('challenge', 'title difficulty category schema');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if the submission belongs to the current user
    if (submission.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this submission' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error.message);
    res.status(500).json({ message: 'Server error retrieving submission' });
  }
}; 