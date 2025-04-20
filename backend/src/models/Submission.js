import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  result: {
    success: {
      type: Boolean,
      required: true
    },
    output: String, // JSON string of the query result
    expectedOutput: String, // JSON string of expected output
    executionTime: Number, // in ms
    error: String
  },
  feedback: {
    aiGeneratedFeedback: String,
    feedbackGenerationTime: Number // in ms
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission; 