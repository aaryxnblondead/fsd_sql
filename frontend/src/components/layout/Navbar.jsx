import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="bg-hr-dark-secondary">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-white ml-2">SQL Learning Platform</span>
            </Link>
          </div>
          
          {/* Desktop navigation menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">Home</Link>
            <Link to="/discussions" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">Discussions</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/challenges" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">Challenges</Link>
                <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">Dashboard</Link>
                <div className="relative ml-3">
                  <div>
                    <button 
                      type="button" 
                      className="flex text-gray-300 hover:text-white"
                      onClick={toggleMenu}
                    >
                      <span className="sr-only">Open user menu</span>
                      <span className="px-3 py-2 rounded-md">
                        {currentUser?.role === 'teacher' && <span className="text-hr-blue mr-1">👨‍🏫</span>}
                        {currentUser?.username || 'User'}
                      </span>
                    </button>
                  </div>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-1 bg-hr-dark-accent rounded-md shadow-lg z-10">
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-hr-dark">Your Profile</Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-hr-dark"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">Student Login</Link>
                  <span className="text-gray-500">|</span>
                  <Link to="/teacher/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md">Teacher Login</Link>
                </div>
                <Link to="/register" className="bg-hr-blue text-white px-3 py-2 rounded-md">Register</Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md">Home</Link>
              <Link to="/discussions" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md">Discussions</Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/challenges" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md">Challenges</Link>
                  <Link to="/dashboard" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md">Dashboard</Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white block w-full text-left px-3 py-2 rounded-md"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md">Student Login</Link>
                  <Link to="/teacher/login" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md">Teacher Login</Link>
                  <Link to="/register" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 