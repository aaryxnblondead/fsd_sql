import Notification from '../models/Notification.js';
import { ApiError } from '../middleware/errorHandler.js';

// @desc    Create a new notification
// @access  Private
export const createNotification = async (req, res, next) => {
  try {
    const { recipient, type, title, message, link, relatedResource, priority, expiresAt } = req.body;
    
    // Create notification with the sender as the current user
    const notification = new Notification({
      recipient,
      sender: req.user.id,
      type,
      title,
      message,
      link: link || null,
      relatedResource: relatedResource || { resourceType: null, resourceId: null },
      priority: priority || 'medium',
      expiresAt: expiresAt || null
    });
    
    await notification.save();
    
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notifications for the current user
// @access  Private
export const getUserNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { recipient: req.user.id };
    if (req.query.read === 'true') filter.read = true;
    if (req.query.read === 'false') filter.read = false;
    if (req.query.type) filter.type = req.query.type;
    
    // Execute query with pagination
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username profilePicture');
      
    // Get total count and unread count for pagination
    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id,
      read: false
    });
    
    res.json({
      notifications,
      unreadCount,
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

// @desc    Mark a notification as read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return next(new ApiError(404, 'Notification not found'));
    }
    
    // Check if the notification belongs to the current user
    if (notification.recipient.toString() !== req.user.id) {
      return next(new ApiError(403, 'Not authorized to access this notification'));
    }
    
    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notification
// @access  Private
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return next(new ApiError(404, 'Notification not found'));
    }
    
    // Check if the notification belongs to the current user
    if (notification.recipient.toString() !== req.user.id) {
      return next(new ApiError(403, 'Not authorized to delete this notification'));
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create system notification for multiple users
// @access  Private (Admin or Teacher)
export const createSystemNotification = async (req, res, next) => {
  try {
    // Check if user is admin or teacher
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return next(new ApiError(403, 'Not authorized to create system notifications'));
    }
    
    const { recipients, type, title, message, link, relatedResource, priority, expiresAt } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return next(new ApiError(400, 'Recipients array is required'));
    }
    
    // Create notifications for all recipients
    const notifications = recipients.map(recipient => ({
      recipient,
      sender: req.user.id,
      type: type || 'system',
      title,
      message,
      link: link || null,
      relatedResource: relatedResource || { resourceType: null, resourceId: null },
      priority: priority || 'medium',
      expiresAt: expiresAt || null
    }));
    
    await Notification.insertMany(notifications);
    
    res.status(201).json({ 
      message: `${notifications.length} notifications created successfully`,
      count: notifications.length
    });
  } catch (error) {
    next(error);
  }
}; 