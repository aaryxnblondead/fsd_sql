import LearningModule from '../models/LearningModule.js';
import LearningProgress from '../models/LearningProgress.js';
import { ApiError } from '../middleware/errorHandler.js';

// @desc    Get all learning modules
// @access  Public
export const getAllModules = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    
    // Text search if provided
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    // Execute query with pagination
    const modules = await LearningModule.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username')
      .select('-lessons'); // Don't include lesson content in list view
      
    // Get total count for pagination
    const total = await LearningModule.countDocuments(filter);
    
    res.json({
      modules,
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

// @desc    Get module by ID
// @access  Public
export const getModuleById = async (req, res, next) => {
  try {
    const module = await LearningModule.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('prerequisites', 'title description difficulty')
      .populate('relatedChallenges', 'title description difficulty');
      
    if (!module) {
      return next(new ApiError(404, 'Learning module not found'));
    }
    
    // If user is authenticated, get their progress for this module
    let progress = null;
    if (req.user) {
      progress = await LearningProgress.findOne({
        user: req.user.id,
        module: module._id
      });
      
      if (!progress) {
        // Create a new progress record for this user and module
        progress = new LearningProgress({
          user: req.user.id,
          module: module._id,
          lessonsProgress: module.lessons.map(lesson => ({
            lessonId: lesson._id,
            isCompleted: false
          }))
        });
        
        await progress.save();
      }
    }
    
    res.json({
      module,
      progress: progress ? {
        isCompleted: progress.isCompleted,
        completedAt: progress.completedAt,
        currentLesson: progress.currentLesson,
        overallScore: progress.overallScore,
        lessonsProgress: progress.lessonsProgress
      } : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new learning module
// @access  Private (Admin or Teacher)
export const createModule = async (req, res, next) => {
  try {
    // Check if user is admin or teacher
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return next(new ApiError(403, 'Not authorized to create learning modules'));
    }
    
    const { title, description, category, difficulty, lessons, prerequisites, relatedChallenges, tags } = req.body;
    
    const module = new LearningModule({
      title,
      description,
      category,
      difficulty,
      lessons: lessons || [],
      prerequisites: prerequisites || [],
      relatedChallenges: relatedChallenges || [],
      tags: tags || [],
      createdBy: req.user.id,
      isPublished: req.body.isPublished || false
    });
    
    await module.save();
    
    res.status(201).json(module);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a learning module
// @access  Private (Admin or Creator)
export const updateModule = async (req, res, next) => {
  try {
    const module = await LearningModule.findById(req.params.id);
    
    if (!module) {
      return next(new ApiError(404, 'Learning module not found'));
    }
    
    // Check if user is authorized to update
    if (module.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Not authorized to update this module'));
    }
    
    // Update fields
    const { title, description, category, difficulty, lessons, prerequisites, 
            relatedChallenges, tags, isPublished, imageUrl } = req.body;
    
    if (title) module.title = title;
    if (description) module.description = description;
    if (category) module.category = category;
    if (difficulty) module.difficulty = difficulty;
    if (lessons) module.lessons = lessons;
    if (prerequisites) module.prerequisites = prerequisites;
    if (relatedChallenges) module.relatedChallenges = relatedChallenges;
    if (tags) module.tags = tags;
    if (imageUrl) module.imageUrl = imageUrl;
    if (isPublished !== undefined) module.isPublished = isPublished;
    
    await module.save();
    
    res.json(module);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a learning module
// @access  Private (Admin or Creator)
export const deleteModule = async (req, res, next) => {
  try {
    const module = await LearningModule.findById(req.params.id);
    
    if (!module) {
      return next(new ApiError(404, 'Learning module not found'));
    }
    
    // Check if user is authorized to delete
    if (module.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Not authorized to delete this module'));
    }
    
    await LearningModule.findByIdAndDelete(req.params.id);
    
    // Delete all progress records related to this module
    await LearningProgress.deleteMany({ module: req.params.id });
    
    res.json({ message: 'Learning module deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson progress
// @access  Private
export const updateLessonProgress = async (req, res, next) => {
  try {
    const { moduleId, lessonId } = req.params;
    const { isCompleted, timeSpent, quizScore, notes } = req.body;
    
    // Find the module to ensure it exists
    const module = await LearningModule.findById(moduleId);
    if (!module) {
      return next(new ApiError(404, 'Learning module not found'));
    }
    
    // Find the specific lesson within the module
    const lesson = module.lessons.id(lessonId);
    if (!lesson) {
      return next(new ApiError(404, 'Lesson not found in the module'));
    }
    
    // Find or create progress record
    let progress = await LearningProgress.findOne({
      user: req.user.id,
      module: moduleId
    });
    
    // If no progress record exists, create a new one
    if (!progress) {
      progress = new LearningProgress({
        user: req.user.id,
        module: moduleId,
        lessonsProgress: module.lessons.map(l => ({
          lessonId: l._id,
          isCompleted: false
        }))
      });
    }
    
    // Find the lesson progress to update
    const lessonProgressIndex = progress.lessonsProgress.findIndex(
      lp => lp.lessonId.toString() === lessonId
    );
    
    // Update lesson progress
    if (lessonProgressIndex !== -1) {
      if (isCompleted !== undefined) {
        progress.lessonsProgress[lessonProgressIndex].isCompleted = isCompleted;
        if (isCompleted) {
          progress.lessonsProgress[lessonProgressIndex].completedAt = new Date();
        }
      }
      
      if (timeSpent !== undefined) {
        progress.lessonsProgress[lessonProgressIndex].timeSpent += timeSpent;
      }
      
      if (quizScore !== undefined) {
        progress.lessonsProgress[lessonProgressIndex].quizScore = quizScore;
      }
      
      if (notes !== undefined) {
        progress.lessonsProgress[lessonProgressIndex].notes = notes;
      }
    }
    
    // Update current lesson
    if (req.body.currentLesson) {
      progress.currentLesson = req.body.currentLesson;
    } else if (isCompleted) {
      // Find the next incomplete lesson
      const lessonOrder = lesson.order;
      const nextLesson = module.lessons.find(l => l.order > lessonOrder);
      
      if (nextLesson) {
        progress.currentLesson = nextLesson._id;
      }
    }
    
    // Update overall progress
    progress.lastAccessedAt = new Date();
    
    // Calculate overall module completion
    const completedLessons = progress.lessonsProgress.filter(lp => lp.isCompleted).length;
    const allLessons = module.lessons.length;
    
    if (completedLessons === allLessons) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }
    
    // Calculate overall score
    if (completedLessons > 0) {
      const quizScores = progress.lessonsProgress
        .filter(lp => lp.quizScore !== null)
        .map(lp => lp.quizScore);
        
      if (quizScores.length > 0) {
        progress.overallScore = quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length;
      }
    }
    
    await progress.save();
    
    res.json({
      message: 'Progress updated successfully',
      progress: {
        isCompleted: progress.isCompleted,
        completedAt: progress.completedAt,
        currentLesson: progress.currentLesson,
        overallScore: progress.overallScore,
        lessonsProgress: progress.lessonsProgress
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's learning progress
// @access  Private
export const getUserProgress = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { user: req.user.id };
    if (req.query.completed === 'true') filter.isCompleted = true;
    if (req.query.completed === 'false') filter.isCompleted = false;
    
    // Execute query with pagination
    const progressList = await LearningProgress.find(filter)
      .sort({ lastAccessedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'module',
        select: 'title description category difficulty',
        populate: {
          path: 'createdBy',
          select: 'username'
        }
      });
      
    // Get total count for pagination
    const total = await LearningProgress.countDocuments(filter);
    
    res.json({
      progress: progressList,
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