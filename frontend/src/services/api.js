import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401) by logging out
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (username, email, password) => api.post('/api/auth/register', { username, email, password }),
  getCurrentUser: () => api.get('/api/auth/me')
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
    
    return api.get(`/api/challenges?${params.toString()}`);
  },
  getChallengeById: (id) => api.get(`/api/challenges/${id}`),
  createChallenge: (data) => api.post('/api/challenges', data),
  updateChallenge: (id, data) => api.put(`/api/challenges/${id}`, data),
  deleteChallenge: (id) => api.delete(`/api/challenges/${id}`)
};

// Submissions API
export const submissionsAPI = {
  submitSolution: (challengeId, code) => api.post('/api/submissions', { challengeId, code }),
  getUserSubmissions: (page = 1, limit = 10, challengeId = null) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (challengeId) params.append('challengeId', challengeId);
    
    return api.get(`/api/submissions?${params.toString()}`);
  },
  getSubmission: (id) => api.get(`/api/submissions/${id}`)
}; 