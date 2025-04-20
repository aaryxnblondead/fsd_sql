import Challenge from '../models/Challenge.js';
import { validationResult } from 'express-validator';

// Get all challenges (paginated)
export const getAllChallenges = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter by difficulty and category if provided
    const filter = {};
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.category) filter.category = req.query.category;
    
    // Get total count for pagination
    const total = await Challenge.countDocuments(filter);
    
    // Get challenges with pagination and sorting
    const challenges = await Challenge.find(filter)
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit)
      .select('-testCases.expectedOutput');
    
    res.json({
      challenges,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get challenges error:', error.message);
    res.status(500).json({ message: 'Server error retrieving challenges' });
  }
};

// Get challenge by ID
export const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Remove expected outputs from hidden test cases
    const sanitizedChallenge = challenge.toObject();
    sanitizedChallenge.testCases = sanitizedChallenge.testCases.map(test => {
      if (test.isHidden) {
        return { ...test, expectedOutput: undefined };
      }
      return test;
    });
    
    res.json(sanitizedChallenge);
  } catch (error) {
    console.error('Get challenge error:', error.message);
    res.status(500).json({ message: 'Server error retrieving challenge' });
  }
};

// Create a new challenge (admin only)
export const createChallenge = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const newChallenge = new Challenge({
      ...req.body
    });
    
    const challenge = await newChallenge.save();
    
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Create challenge error:', error.message);
    res.status(500).json({ message: 'Server error creating challenge' });
  }
};

// Update challenge (admin only)
export const updateChallenge = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Update fields
    const updateData = { ...req.body, updatedAt: Date.now() };
    
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(updatedChallenge);
  } catch (error) {
    console.error('Update challenge error:', error.message);
    res.status(500).json({ message: 'Server error updating challenge' });
  }
};

// Delete challenge (admin only)
export const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    await Challenge.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Delete challenge error:', error.message);
    res.status(500).json({ message: 'Server error deleting challenge' });
  }
}; 