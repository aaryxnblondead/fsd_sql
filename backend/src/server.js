import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import challengeRoutes from './routes/challenges.js';
import submissionRoutes from './routes/submissions.js';
import openaiRoutes from './routes/openai.js';
import discussionRoutes from './routes/discussions.js';
import learningModuleRoutes from './routes/learningModules.js';
import notificationRoutes from './routes/notifications.js';
import questionRoutes from './routes/questions.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { rateLimit } from './middleware/rateLimit.js';

// Import sample data initializer
import { initializeSampleChallenges } from './config/sampleChallenges.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Convert ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Apply rate limiting
app.use(rateLimit);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/learning-modules', learningModuleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/questions', questionRoutes);

// Basic route for testing
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to SQL Learning Platform API',
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Add root route to prevent 404 errors
app.get('/', (req, res) => {
  res.json({
    message: 'SQL Learning Platform API is running',
    availableAt: '/api'
  });
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const frontendBuildPath = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendBuildPath));

  // For any route that is not an API route, serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sql_learning_platform';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    // Initialize sample challenges
    if (process.env.NODE_ENV === 'development') {
      await initializeSampleChallenges();
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Start the server
startServer(); 