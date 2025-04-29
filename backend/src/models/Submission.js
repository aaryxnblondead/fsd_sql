import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
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
  query: {
    type: String,
    required: true
  },
  result: {
    success: {
      type: Boolean,
      required: true
    },
    message: String,
    data: mongoose.Schema.Types.Mixed,
    error: String
  },
  executionTime: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  aiAnalysis: {
    type: String,
    default: ''
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create index to quickly find submissions by user and challenge
SubmissionSchema.index({ user: 1, challenge: 1 });

// Add a static method to find the best submission for a challenge by a user
SubmissionSchema.statics.findBestSubmission = async function(userId, challengeId) {
  return this.findOne({
    user: userId,
    challenge: challengeId,
    isCorrect: true
  }).sort({ score: -1, executionTime: 1 }).exec();
};

const Submission = mongoose.model('Submission', SubmissionSchema);

export default Submission; 