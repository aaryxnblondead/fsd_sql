import Discussion from '../models/Discussion.js';
import { ApiError } from '../middleware/errorHandler.js';

// @desc    Get all discussions with pagination and filters
// @access  Public
export const getAllDiscussions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (req.query.tag) filter.tags = req.query.tag;
    if (req.query.challenge) filter.challenge = req.query.challenge;
    if (req.query.solved === 'true') filter.isSolved = true;
    if (req.query.solved === 'false') filter.isSolved = false;
    
    // Execute query with pagination
    const discussions = await Discussion.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePicture')
      .populate('challenge', 'title difficulty');
      
    // Get total count for pagination
    const total = await Discussion.countDocuments(filter);
    
    res.json({
      discussions,
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

// @desc    Get discussion by ID
// @access  Public
export const getDiscussionById = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('user', 'username profilePicture')
      .populate('challenge', 'title difficulty')
      .populate('comments.user', 'username profilePicture');
      
    if (!discussion) {
      return next(new ApiError(404, 'Discussion not found'));
    }
    
    // Increment view count
    discussion.views += 1;
    await discussion.save();
    
    res.json(discussion);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new discussion
// @access  Private
export const createDiscussion = async (req, res, next) => {
  try {
    const { title, content, challenge, tags } = req.body;
    
    const discussion = new Discussion({
      title,
      content,
      user: req.user.id,
      challenge: challenge || null,
      tags: tags || []
    });
    
    await discussion.save();
    
    res.status(201).json(discussion);
  } catch (error) {
    next(error);
  }
};

// @desc    Update discussion
// @access  Private (owner only)
export const updateDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return next(new ApiError(404, 'Discussion not found'));
    }
    
    // Check ownership
    if (discussion.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Not authorized to update this discussion'));
    }
    
    const { title, content, tags } = req.body;
    
    discussion.title = title || discussion.title;
    discussion.content = content || discussion.content;
    discussion.tags = tags || discussion.tags;
    
    await discussion.save();
    
    res.json(discussion);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete discussion
// @access  Private (owner or admin)
export const deleteDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return next(new ApiError(404, 'Discussion not found'));
    }
    
    // Check ownership
    if (discussion.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Not authorized to delete this discussion'));
    }
    
    await Discussion.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Discussion removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to discussion
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return next(new ApiError(404, 'Discussion not found'));
    }
    
    const { content } = req.body;
    
    discussion.comments.push({
      user: req.user.id,
      content
    });
    
    await discussion.save();
    
    // Populate the user details in the latest comment
    await Discussion.populate(discussion, {
      path: 'comments.user',
      select: 'username profilePicture',
      match: { _id: req.user.id }
    });
    
    res.status(201).json(discussion.comments[discussion.comments.length - 1]);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark comment as answer
// @access  Private (discussion owner only)
export const markAsAnswer = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return next(new ApiError(404, 'Discussion not found'));
    }
    
    // Check ownership
    if (discussion.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Not authorized to mark answers in this discussion'));
    }
    
    const comment = discussion.comments.id(req.params.commentId);
    
    if (!comment) {
      return next(new ApiError(404, 'Comment not found'));
    }
    
    comment.isAnswer = !comment.isAnswer;
    discussion.isSolved = discussion.comments.some(c => c.isAnswer);
    
    await discussion.save();
    
    res.json(discussion);
  } catch (error) {
    next(error);
  }
};

// @desc    Like/unlike a discussion
// @access  Private
export const toggleLikeDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return next(new ApiError(404, 'Discussion not found'));
    }
    
    const userId = req.user.id;
    const likeIndex = discussion.likes.findIndex(id => id.toString() === userId);
    
    if (likeIndex === -1) {
      // Like
      discussion.likes.push(userId);
    } else {
      // Unlike
      discussion.likes.splice(likeIndex, 1);
    }
    
    await discussion.save();
    
    res.json({ 
      likes: discussion.likes.length,
      isLiked: likeIndex === -1 // True if just liked, false if just unliked
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/unlike a comment
// @access  Private
export const toggleLikeComment = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return next(new ApiError(404, 'Discussion not found'));
    }
    
    const comment = discussion.comments.id(req.params.commentId);
    
    if (!comment) {
      return next(new ApiError(404, 'Comment not found'));
    }
    
    const userId = req.user.id;
    const likeIndex = comment.likes.findIndex(id => id.toString() === userId);
    
    if (likeIndex === -1) {
      // Like
      comment.likes.push(userId);
    } else {
      // Unlike
      comment.likes.splice(likeIndex, 1);
    }
    
    await discussion.save();
    
    res.json({ 
      likes: comment.likes.length,
      isLiked: likeIndex === -1 // True if just liked, false if just unliked
    });
  } catch (error) {
    next(error);
  }
}; 