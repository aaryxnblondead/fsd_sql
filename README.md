# SQL Learning Platform

An interactive MERN stack application for learning and practicing SQL, similar to HackerRank and W3Schools. This platform allows students to practice SQL queries, get immediate feedback, and learn from AI-powered explanations.

## Features

- User authentication (signup/login)
- Interactive SQL editor with syntax highlighting
- Real-time query execution against isolated SQLite instances
- Results comparison with expected output
- AI-powered feedback using OpenAI API
- Progress tracking dashboard
- Structured learning challenges by difficulty and category

## Tech Stack

- **Frontend**: React (Vite), TailwindCSS, Monaco Editor
- **Backend**: Node.js, Express
- **Databases**: 
  - MongoDB (User data, progress tracking)
  - SQLite (SQL query execution)
- **API Integration**: OpenAI API for feedback generation

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16+)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sql-learning-platform.git
   cd sql-learning-platform
   ```

2. Install dependencies:
   ```
   npm install
   ```
   This will install dependencies for both frontend and backend.

3. Create a `.env` file in the `backend` directory:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/sql-learning-platform
   JWT_SECRET=your_super_secret_key_change_in_production
   NODE_ENV=development
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Running the Application

1. Start both frontend and backend:
   ```
   npm run dev
   ```

2. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

## Development

- Frontend code is in the `frontend` directory
- Backend code is in the `backend` directory
- To run only the frontend: `npm run start:frontend`
- To run only the backend: `npm run start:backend`

## Project Structure

```
sql-learning-platform/
├── backend/              # Express server
│   ├── databases/        # SQLite database files
│   ├── src/              # Server code
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── package.json      # Backend dependencies
├── frontend/             # React application
│   ├── public/           # Static files
│   ├── src/              # Frontend code
│   │   ├── assets/       # Images, fonts, etc.
│   │   ├── components/   # React components
│   │   ├── context/      # React context
│   │   ├── pages/        # Page components
│   │   └── services/     # API client and utilities
│   └── package.json      # Frontend dependencies
└── package.json          # Root package.json for scripts
```

## Deployment

### Frontend
1. Build the frontend:
   ```
   npm run build
   ```
2. The build output will be in `frontend/dist`

### Backend
1. Set the environment variables for production
2. Start the server:
   ```
   cd backend
   npm start
   ```

## License

MIT 