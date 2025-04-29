import Question from '../models/Question.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { ApiError } from '../middleware/errorHandler.js';

// @desc    Get all questions (with filters)
// @access  Private
export const getAllQuestions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Filter by student or teacher
    if (req.user.role === 'teacher') {
      // Teachers can see questions targeted to them or public questions
      filter.$or = [
        { targetTeacher: req.user.id },
        { targetTeacher: null }
      ];
      
      // Filter by privacy if specified
      if (req.query.private === 'true') {
        filter.targetTeacher = req.user.id;
      } else if (req.query.private === 'false') {
        filter.targetTeacher = null;
      }
    } else if (req.user.role === 'admin') {
      // Admins can see all questions
      // No additional filters needed
    } else {
      // Regular users can only see their own questions and public questions
      filter.$or = [
        { student: req.user.id },
        { isPrivate: false }
      ];
      
      // Filter by own questions only
      if (req.query.own === 'true') {
        filter.student = req.user.id;
      }
    }
    
    // Text search if provided
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    // Execute query with pagination
    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('student', 'username profilePicture')
      .populate('targetTeacher', 'username profilePicture')
      .populate('answers.user', 'username profilePicture');
      
    // Get total count for pagination
    const total = await Question.countDocuments(filter);
    
    res.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get question by ID
// @access  Private
export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('student', 'username profilePicture')
      .populate('targetTeacher', 'username profilePicture')
      .populate('answers.user', 'username profilePicture');
      
    if (!question) {
      return next(new ApiError(404, 'Question not found'));
    }
    
    // Check if user has access
    if (
      question.isPrivate && 
      question.student.toString() !== req.user.id && 
      (question.targetTeacher && question.targetTeacher.toString() !== req.user.id) && 
      req.user.role !== 'admin'
    ) {
      return next(new ApiError(403, 'Not authorized to view this question'));
    }
    
    // Increment view count
    question.views += 1;
    await question.save();
    
    res.json(question);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new question
// @access  Private
export const createQuestion = async (req, res, next) => {
  try {
    const { title, content, category, tags, codeSnippet, targetTeacher, isPrivate, priority, relatedResource } = req.body;
    
    // Validate targetTeacher if provided
    if (targetTeacher) {
      const teacher = await User.findById(targetTeacher);
      
      if (!teacher) {
        return next(new ApiError(404, 'Teacher not found'));
      }
      
      if (teacher.role !== 'teacher') {
        return next(new ApiError(400, 'Target user is not a teacher'));
      }
    }
    
    const question = new Question({
      title,
      content,
      student: req.user.id,
      targetTeacher: targetTeacher || null,
      category,
      tags: tags || [],
      codeSnippet: codeSnippet || null,
      isPrivate: isPrivate || false,
      priority: priority || 'medium',
      relatedResource: relatedResource || { resourceType: null, resourceId: null }
    });
    
    await question.save();
    
    // Create notification for teacher if targeted
    if (targetTeacher) {
      const notification = new Notification({
        recipient: targetTeacher,
        sender: req.user.id,
        type: 'question',
        title: 'New Question Assigned',
        message: `You have a new question: ${title}`,
        link: `/questions/${question._id}`,
        relatedResource: {
          resourceType: 'question',
          resourceId: question._id
        },
        priority: priority || 'medium'
      });
      
      await notification.save();
    }
    
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a question
// @access  Private (Student who asked or Admin)
export const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return next(new ApiError(404, 'Question not found'));
    }
    
    // Check if user is authorized to update
    if (question.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Not authorized to update this question'));
    }
    
    // Only allow updates if question is still open
    if (question.status !== 'open' && req.user.role !== 'admin') {
      return next(new ApiError(400, 'Cannot update a question that has been answered or closed'));
    }
    
    // Update fields
    const { title, content, category, tags, codeSnippet, targetTeacher, isPrivate, priority, status } = req.body;
    
    if (title) question.title = title;
    if (content) question.content = content;
    if (category) question.category = category;
    if (tags) question.tags = tags;
    if (codeSnippet !== undefined) question.codeSnippet = codeSnippet;
    if (isPrivate !== undefined) question.isPrivate = isPrivate;
    if (priority) question.priority = priority;
    
    // Only admin can change status directly
    if (status && req.user.role === 'admin') {
      question.status = status;
    }
    
    // If changing target teacher, validate and notify
    if (targetTeacher && targetTeacher !== question.targetTeacher?.toString()) {
      const teacher = await User.findById(targetTeacher);
      
      if (!teacher) {
        return next(new ApiError(404, 'Teacher not found'));
      }
      
      if (teacher.role !== 'teacher') {
        return next(new ApiError(400, 'Target user is not a teacher'));
      }
      
      question.targetTeacher = targetTeacher;
      
      // Create notification for new teacher
      const notification = new Notification({
        recipient: targetTeacher,
        sender: req.user.id,
        type: 'question',
        title: 'Question Assigned to You',
        message: `You have been assigned a question: ${question.title}`,
        link: `/questions/${question._id}`,
        relatedResource: {
          resourceType: 'question',
          resourceId: question._id
        },
        priority: question.priority
      });
      
      await notification.save();
    }
    
    await question.save();
    
    res.json(question);
  } catch (error) {
    next(error);
  }
};

// @desc    Add an answer to a question
// @access  Private
export const addAnswer = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return next(new ApiError(404, 'Question not found'));
    }
    
    // Create the answer
    const { content, codeSnippet } = req.body;
    
    const answer = {
      user: req.user.id,
      content,
      codeSnippet: codeSnippet || null,
      attachments: req.body.attachments || []
    };
    
    question.answers.push(answer);
    
    // If teacher answers, update status
    if (req.user.role === 'teacher' || req.user.id === question.targetTeacher?.toString()) {
      question.status = 'answered';
    }
    
    await question.save();
    
    // Create notification for the student
    const notification = new Notification({
      recipient: question.student,
      sender: req.user.id,
      type: 'answer',
      title: 'Answer to Your Question',
      message: `Your question "${question.title}" has received an answer`,
      link: `/questions/${question._id}`,
      relatedResource: {
        resourceType: 'question',
        resourceId: question._id
      }
    });
    
    await notification.save();
    
    // Populate user details for the new answer
    await Question.populate(question, {
      path: 'answers.user',
      select: 'username profilePicture',
      match: { _id: req.user.id }
    });
    
    res.status(201).json({
      message: 'Answer added successfully',
      answer: question.answers[question.answers.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark an answer as accepted
// @access  Private (Student who asked the question)
export const acceptAnswer = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return next(new ApiError(404, 'Question not found'));
    }
    
    // Check if user is authorized (only the student who asked can accept)
    if (question.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Not authorized to accept answers for this question'));
    }
    
    // Find the answer
    const answer = question.answers.id(req.params.answerId);
    
    if (!answer) {
      return next(new ApiError(404, 'Answer not found'));
    }
    
    // Toggle accepted status
    answer.isAccepted = !answer.isAccepted;
    
    // If any answer is accepted, mark question as solved
    const hasAcceptedAnswer = question.answers.some(a => a.isAccepted);
    
    if (hasAcceptedAnswer) {
      question.status = 'closed';
    } else {
      question.status = 'answered';
    }
    
    await question.save();
    
    // If an answer was accepted, notify the answer author
    if (answer.isAccepted) {
      const notification = new Notification({
        recipient: answer.user,
        sender: req.user.id,
        type: 'answer',
        title: 'Answer Accepted',
        message: `Your answer to "${question.title}" has been accepted as the solution`,
        link: `/questions/${question._id}`,
        relatedResource: {
          resourceType: 'question',
          resourceId: question._id
        }
      });
      
      await notification.save();
    }
    
    res.json(question);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a question
// @access  Private (Student who asked or Admin)
export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return next(new ApiError(404, 'Question not found'));
    }
    
    // Check if user is authorized to delete
    if (question.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Not authorized to delete this question'));
    }
    
    await Question.findByIdAndDelete(req.params.id);
    
    // Delete all related notifications
    await Notification.deleteMany({
      'relatedResource.resourceType': 'question',
      'relatedResource.resourceId': req.params.id
    });
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
}; 