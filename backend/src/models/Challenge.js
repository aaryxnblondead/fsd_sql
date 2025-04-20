import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  category: {
    type: String,
    enum: ['basics', 'joins', 'subqueries', 'aggregation', 'advanced'],
    required: true
  },
  initialCode: {
    type: String,
    default: '-- Write your SQL query here'
  },
  databaseFile: {
    type: String, // Path to the SQLite database file
    required: true
  },
  testCases: [{
    input: String, // SQL query
    expectedOutput: String, // Expected result in JSON format
    isHidden: {
      type: Boolean,
      default: false
    }
  }],
  hints: [{
    text: String,
    cost: {
      type: Number,
      default: 5 // XP cost to view the hint
    }
  }],
  reward: {
    xp: {
      type: Number,
      default: 10
    }
  },
  order: {
    type: Number,
    required: true
  },
  schema: {
    type: String, // SQL schema definition for reference
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge; 