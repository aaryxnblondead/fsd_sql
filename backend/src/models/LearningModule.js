import mongoose from 'mongoose';

// Schema for individual lessons within a module
const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['theory', 'video', 'interactive', 'quiz'],
    default: 'theory'
  },
  interactiveElements: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  videoUrl: {
    type: String,
    default: null
  },
  estimatedTime: {
    type: Number, // Time in minutes
    default: 10
  },
  quizQuestions: [{
    question: String,
    options: [String],
    correctAnswer: Number, // Index of the correct option
    explanation: String
  }]
}, {
  timestamps: true
});

// Main Learning Module schema
const LearningModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['basics', 'joins', 'subqueries', 'aggregation', 'advanced'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  lessons: [LessonSchema],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningModule'
  }],
  relatedChallenges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
LearningModuleSchema.index({ title: 'text', description: 'text', tags: 'text' });
LearningModuleSchema.index({ category: 1 });
LearningModuleSchema.index({ difficulty: 1 });
LearningModuleSchema.index({ isPublished: 1 });

const LearningModule = mongoose.model('LearningModule', LearningModuleSchema);

export default LearningModule; 