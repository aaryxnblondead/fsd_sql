import mongoose from 'mongoose';

// Schema for answers to questions
const AnswerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  codeSnippet: {
    type: String,
    default: null
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  isAccepted: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Main Question schema
const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'answered', 'closed'],
    default: 'open'
  },
  category: {
    type: String,
    enum: ['sql-basics', 'joins', 'subqueries', 'aggregation', 'advanced', 'other'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  codeSnippet: {
    type: String,
    default: null
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  answers: [AnswerSchema],
  relatedResource: {
    resourceType: {
      type: String,
      enum: ['challenge', 'discussion', 'learning-module', 'lesson'],
      default: null
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  views: {
    type: Number,
    default: 0
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
QuestionSchema.index({ student: 1 });
QuestionSchema.index({ targetTeacher: 1 });
QuestionSchema.index({ status: 1 });
QuestionSchema.index({ category: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ createdAt: -1 });
QuestionSchema.index({ title: 'text', content: 'text' });

const Question = mongoose.model('Question', QuestionSchema);

export default Question; 