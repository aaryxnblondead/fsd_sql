import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Track retry attempts
    if (!originalRequest._retry) {
      originalRequest._retry = 0;
    }
    
    // Handle network errors with retry logic
    if (error.message === 'Network Error' && originalRequest._retry < 2) {
      originalRequest._retry++;
      
      // Exponential backoff (1s, 2s)
      const backoffTime = 1000 * Math.pow(2, originalRequest._retry - 1);
      
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      console.log(`Retrying request (${originalRequest._retry}/2)...`);
      return api(originalRequest);
    }
    
    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && 
        error.response?.data?.message?.includes('expired') && 
        !originalRequest._hasRefreshAttempt) {
      
      // Mark that we've attempted a refresh
      originalRequest._hasRefreshAttempt = true;
      
      try {
        // Clear local storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // If in browser environment
        if (typeof window !== 'undefined') {
          toast.error("Your session has expired. Please log in again.");
          window.location.href = '/login';
        }
      } catch (refreshError) {
        console.error('Error during auth refresh:', refreshError);
      }
      
      return Promise.reject(error);
    }
    
    // Format error message for UI
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 
                      error.response.data?.error || 
                      'Server error occurred';
      
      const status = error.response.status;
      
      if (status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (status !== 401) {
        // Don't show toast for 401 as we handle it separately
        toast.error(message);
      }
    } else if (error.request) {
      // Request made but no response received
      toast.error('No response from server. Please check your connection.');
    } else {
      // Error in setting up request
      toast.error('Request failed. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// Helper for safe error handling
const safeRequest = async (apiCall) => {
  try {
    const response = await apiCall();
    return {
      data: response.data,
      success: true,
      error: null
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: {
        message: error.response?.data?.message || error.message || 'Unknown error',
        status: error.response?.status || 500
      }
    };
  }
};

// API methods with safe error handling
export const apiService = {
  // Generic methods
  get: (url, params = {}) => safeRequest(() => api.get(url, { params })),
  post: (url, data = {}) => safeRequest(() => api.post(url, data)),
  put: (url, data = {}) => safeRequest(() => api.put(url, data)),
  patch: (url, data = {}) => safeRequest(() => api.patch(url, data)),
  delete: (url) => safeRequest(() => api.delete(url)),
  
  // Specific API methods can be added here
  uploadFile: async (url, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) onProgress(percentCompleted);
        },
      });
      
      return {
        data: response.data,
        success: true,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        error: {
          message: error.response?.data?.message || error.message || 'Upload failed',
          status: error.response?.status || 500
        }
      };
    }
  }
};

export default api;

// Auth API
export const authAPI = {
  login: (credentials) => {
    // Handle different formats of login credentials
    if (typeof credentials === 'object' && credentials !== null) {
      return api.post('/auth/login', credentials);
    } else {
      // Legacy support for email, password format
      const [email, password] = arguments;
      return api.post('/auth/login', { email, password });
    }
  },
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me')
};

// Challenges API
export const challengesAPI = {
  getAllChallenges: (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    // Add filters if provided
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.category) params.append('category', filters.category);
    
    return api.get(`/challenges?${params.toString()}`);
  },
  getChallengeById: (id) => api.get(`/challenges/${id}`),
  createChallenge: (data) => api.post('/challenges', data),
  updateChallenge: (id, data) => api.put(`/challenges/${id}`, data),
  deleteChallenge: (id) => api.delete(`/challenges/${id}`)
};

// Submissions API
export const submissionsAPI = {
  submitSolution: (challengeId, code) => api.post('/submissions', { challengeId, code }),
  getUserSubmissions: (page = 1, limit = 10, challengeId = null) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (challengeId) params.append('challengeId', challengeId);
    
    return api.get(`/submissions?${params.toString()}`);
  },
  getSubmission: (id) => api.get(`/submissions/${id}`)
};

// Discussion forum API endpoints
export const discussionsAPI = {
  // Get all discussions with pagination and filters
  getAllDiscussions: (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    
    return api.get(`/discussions?${queryParams}`);
  },
  
  // Get discussion by ID
  getDiscussion: (id) => {
    return api.get(`/discussions/${id}`);
  },
  
  // Create a new discussion
  createDiscussion: (discussionData) => {
    return api.post('/discussions', discussionData);
  },
  
  // Update discussion
  updateDiscussion: (id, discussionData) => {
    return api.put(`/discussions/${id}`, discussionData);
  },
  
  // Delete discussion
  deleteDiscussion: (id) => {
    return api.delete(`/discussions/${id}`);
  },
  
  // Add comment to discussion
  addComment: (discussionId, content) => {
    return api.post(`/discussions/${discussionId}/comments`, { content });
  },
  
  // Mark comment as answer
  markAsAnswer: (discussionId, commentId) => {
    return api.put(`/discussions/${discussionId}/comments/${commentId}/answer`);
  },
  
  // Like/unlike a discussion
  toggleLikeDiscussion: (discussionId) => {
    return api.put(`/discussions/${discussionId}/like`);
  },
  
  // Like/unlike a comment
  toggleLikeComment: (discussionId, commentId) => {
    return api.put(`/discussions/${discussionId}/comments/${commentId}/like`);
  }
}; 