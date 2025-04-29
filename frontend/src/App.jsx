import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ErrorBoundary from './components/common/ErrorBoundary';
import AccessibilityMenu from './components/common/AccessibilityMenu';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherLogin from './pages/TeacherLogin';
import Dashboard from './pages/Dashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ChallengeList from './pages/ChallengeList';
import ChallengeDetail from './pages/ChallengeDetail';
import SubmissionDetail from './pages/SubmissionDetail';
import NotFound from './pages/NotFound';
import DiscussionList from './pages/DiscussionList';
import DiscussionDetail from './pages/DiscussionDetail';
import CreateDiscussion from './pages/CreateDiscussion';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  console.log('ProtectedRoute check - isAuthenticated:', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('User is not authenticated, redirecting to login page');
    return <Navigate to="/login" replace />;
  }
  
  console.log('User is authenticated, rendering protected content');
  return children;
};

// Role-specific protected route
const RoleProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, currentUser } = useAuth();
  
  console.log('RoleProtectedRoute check - user:', currentUser);
  
  if (!isAuthenticated) {
    console.log('User is not authenticated, redirecting to login page');
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser?.role !== requiredRole) {
    console.log(`User doesn't have required role, redirecting to dashboard`);
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated, currentUser } = useAuth();
  
  console.log('App render - Auth state:', { isAuthenticated, userRole: currentUser?.role });
  
  return (
    <ErrorBoundary>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      
      <div className="min-h-screen bg-hr-dark flex flex-col layout-container">
        <Navbar />
        
        <main id="main-content" className="container mx-auto px-4 py-8 flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/teacher/login" element={<TeacherLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Discussion routes */}
            <Route path="/discussions" element={<DiscussionList />} />
            <Route path="/discussions/:id" element={<DiscussionDetail />} />
            <Route 
              path="/discussions/new" 
              element={
                <ProtectedRoute>
                  <CreateDiscussion />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  {currentUser?.role === 'teacher' ? <Navigate to="/teacher/dashboard" replace /> : <Dashboard />}
                </ProtectedRoute>
              } 
            />
            
            {/* Teacher-specific routes */}
            <Route 
              path="/teacher/dashboard" 
              element={
                <RoleProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                </RoleProtectedRoute>
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
        
        {/* Accessibility Menu */}
        <AccessibilityMenu />
      </div>
    </ErrorBoundary>
  );
}

export default App;
