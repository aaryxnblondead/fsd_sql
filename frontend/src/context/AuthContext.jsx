import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if token is valid and set user
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          // Check if token is expired
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expired
            logout();
          } else {
            // Token valid, get user data
            api.defaults.headers.common['x-auth-token'] = token;
            const response = await api.get('/api/auth/me');
            setCurrentUser(response.data);
          }
        } catch (error) {
          console.error('Token verification error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set token in axios default headers
      api.defaults.headers.common['x-auth-token'] = token;
      
      setToken(token);
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to login'
      };
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      console.log('Attempting registration with:', { username, email }); // Log registration attempt
      
      const response = await api.post('/api/auth/register', {
        username,
        email,
        password
      });
      
      console.log('Registration response:', response.data); // Log the response
      
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set token in axios default headers
      api.defaults.headers.common['x-auth-token'] = token;
      
      setToken(token);
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Enhanced error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
        return {
          success: false,
          message: error.response.data.message || 'Registration failed'
        };
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        return {
          success: false,
          message: 'No response from server. Please check your connection.'
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          success: false,
          message: error.message || 'Failed to register'
        };
      }
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 