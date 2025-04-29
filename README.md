# SQL Learning Platform

A comprehensive platform for learning SQL through interactive challenges, real-time query execution, and AI-powered feedback.

## Features

- **Interactive SQL Challenges**: Practice SQL with real databases
- **Real-time Query Execution**: Run SQL queries against isolated SQLite instances
- **User Progress Tracking**: Track your learning journey with completion stats
- **AI-Powered Feedback**: Get intelligent feedback on your query solutions
- **Responsive UI**: Modern interface works on desktop and mobile devices

## Tech Stack

### Backend
- Node.js & Express
- MongoDB (user data, challenges)
- SQLite (query execution)
- JWT Authentication
- OpenAI API integration

### Frontend
- React 19
- Tailwind CSS for styling
- Monaco Editor for SQL editing
- React Router for navigation
- Axios for API communication

## Prerequisites

- Node.js (v18+)
- npm or yarn
- MongoDB (local or Atlas connection)
- OpenAI API key (for AI feedback)

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/yourusername/sql-learning-platform.git
cd sql-learning-platform
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sql-learning-platform
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Fix esbuild if needed:
```bash
npm run fix-esbuild
```

4. Start the frontend development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Testing

### Backend Tests

```bash
cd backend
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate test coverage report
```

### Frontend Tests

```bash
cd frontend
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate test coverage report
npm run test:ui        # Open Vitest UI for interactive testing
```

## Deployment

### Backend Deployment

1. Set environment variables in your production environment
2. Build and start the backend:
```bash
npm start
```

### Frontend Deployment

1. Build the frontend:
```bash
npm run build
```

2. Deploy the contents of the `dist` directory to your web server or hosting service.

## Project Structure

```
/
├── backend/                # Backend code
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── databases/          # SQLite database files
│   └── tests/              # Backend tests
│
├── frontend/               # Frontend code
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── assets/         # Images, fonts, etc.
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── __tests__/          # Frontend tests
│
└── README.md               # This file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenAI](https://openai.com/) for providing AI capabilities
- [SQLite](https://www.sqlite.org/) for the embedded database engine
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor 