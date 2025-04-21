import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api, { authAPI } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verify token and fetch user data
  const verifyTokenAndFetchUser = useCallback(async (authToken) => {
    if (!authToken) {
      console.log('No token provided to verify');
      return false;
    }
    
    try {
      console.log('Verifying token...');
      
      // Check if token is expired
      const decodedToken = jwtDecode(authToken);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp < currentTime) {
        console.log('Token expired');
        return false;
      }
      
      console.log('Token is valid, fetching user data');
      
      // Set token in axios default headers
      api.defaults.headers.common['x-auth-token'] = authToken;
      
      try {
        const response = await authAPI.getCurrentUser();
        console.log('User data fetched successfully:', response.data);
        setCurrentUser(response.data);
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error('Error fetching current user:', error);
        return false;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }, []);

  // Check if token is valid and set user on mount and token change
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        const isValid = await verifyTokenAndFetchUser(token);
        
        if (!isValid) {
          console.log('Invalid token found, logging out');
          logout();
        }
      } else {
        console.log('No token found, user is not logged in');
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    initAuth();
  }, [token, verifyTokenAndFetchUser]);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('Login attempt with email:', email);
      
      const response = await authAPI.login(email, password);
      console.log('Login successful, response:', response.data);
      
      const { token: newToken, user } = response.data;
      
      if (!newToken) {
        console.error('No token received in login response');
        return { 
          success: false, 
          message: 'Authentication failed - no token received' 
        };
      }
      
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      
      // Set token in axios default headers
      api.defaults.headers.common['x-auth-token'] = newToken;
      
      // Update state
      setToken(newToken);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      console.log('Authentication state updated, user is now authenticated');
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        // Server responded with error
        console.error('Server error response:', error.response.data);
        return {
          success: false,
          message: error.response.data.message || 'Invalid credentials'
        };
      } else if (error.request) {
        // Request made but no response
        console.error('No response received:', error.request);
        return {
          success: false,
          message: 'No response from server. Please check your connection.'
        };
      } else {
        // Error in request setup
        return {
          success: false,
          message: error.message || 'Failed to login'
        };
      }
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      console.log('Attempting registration with:', { username, email });
      
      const response = await authAPI.register(username, email, password);
      console.log('Registration response:', response.data);
      
      const { token: newToken, user } = response.data;
      
      if (!newToken) {
        console.error('No token received in registration response');
        return { 
          success: false, 
          message: 'Registration successful but authentication failed - no token received' 
        };
      }
      
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      
      // Set token in axios default headers
      api.defaults.headers.common['x-auth-token'] = newToken;
      
      // Update state
      setToken(newToken);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
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
    console.log('Logging out user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 