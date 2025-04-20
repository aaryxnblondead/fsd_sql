import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChallengeList from './pages/ChallengeList';
import ChallengeDetail from './pages/ChallengeDetail';
import SubmissionDetail from './pages/SubmissionDetail';
import NotFound from './pages/NotFound';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();
  
  console.log('ProtectedRoute check:', { isAuthenticated, currentUser });
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-hr-dark flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/challenges" 
            element={
              <ProtectedRoute>
                <ChallengeList />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/challenges/:id" 
            element={
              <ProtectedRoute>
                <ChallengeDetail />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/submissions/:id" 
            element={
              <ProtectedRoute>
                <SubmissionDetail />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <footer className="py-4 text-center text-gray-400 bg-hr-dark-secondary">
        <p>SQL Learning Platform &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
