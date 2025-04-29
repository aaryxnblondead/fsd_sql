import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationCenter } from '../common';
import { FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <header className="bg-hr-dark-blue text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">SQL<span className="text-hr-green">Master</span></Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              <Link to="/challenges" className="hover:text-hr-green transition-colors">Challenges</Link>
              <Link to="/discussions" className="hover:text-hr-green transition-colors">Discussions</Link>
              <Link to="/learning" className="hover:text-hr-green transition-colors">Learning</Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <NotificationCenter />
                  <div className="relative group">
                    <button className="flex items-center space-x-2 hover:text-hr-green transition-colors">
                      <img 
                        src={currentUser.profilePicture || '/images/default-avatar.png'} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span>{currentUser.username}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                      <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</Link>
                      <Link to="/settings" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Settings</Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-hr-green transition-colors">Login</Link>
                  <Link to="/register" className="bg-hr-green text-white px-4 py-2 rounded hover:bg-hr-green-dark transition-colors">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-3">
              <Link to="/challenges" className="hover:text-hr-green transition-colors">Challenges</Link>
              <Link to="/discussions" className="hover:text-hr-green transition-colors">Discussions</Link>
              <Link to="/learning" className="hover:text-hr-green transition-colors">Learning</Link>
            </nav>
            {currentUser ? (
              <div className="mt-4 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={currentUser.profilePicture || '/images/default-avatar.png'} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span>{currentUser.username}</span>
                  </div>
                  <NotificationCenter />
                </div>
                <Link to="/profile" className="hover:text-hr-green transition-colors">Profile</Link>
                <Link to="/settings" className="hover:text-hr-green transition-colors">Settings</Link>
                <button 
                  onClick={handleLogout}
                  className="text-left text-hr-green hover:text-hr-green-dark transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col space-y-3">
                <Link to="/login" className="hover:text-hr-green transition-colors">Login</Link>
                <Link to="/register" className="bg-hr-green text-white px-4 py-2 rounded hover:bg-hr-green-dark transition-colors text-center">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 