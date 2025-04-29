import mongoose from 'mongoose';

// Schema for tracking completion of individual lessons
const LessonProgressSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  quizScore: {
    type: Number,
    default: null
  },
  timeSpent: {
    type: Number, // Time in seconds
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  _id: false
});

// Main Learning Progress schema
const LearningProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningModule',
    required: true
  },
  lessonsProgress: [LessonProgressSchema],
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  currentLesson: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  overallScore: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
LearningProgressSchema.index({ user: 1, module: 1 }, { unique: true });
LearningProgressSchema.index({ user: 1, isCompleted: 1 });
LearningProgressSchema.index({ module: 1, isCompleted: 1 });

const LearningProgress = mongoose.model('LearningProgress', LearningProgressSchema);

export default LearningProgress; 