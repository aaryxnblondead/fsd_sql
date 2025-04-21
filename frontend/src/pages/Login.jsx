import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is already authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Attempting login with email:', email);
      
      // Try login via the context
      const result = await login(email, password);
      
      if (result.success) {
        console.log('Login successful, navigating to dashboard');
        toast.success('Login successful!');
        
        // Force a delay to ensure the auth state is updated
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        console.error('Login failed:', result.message);
        toast.error(result.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Show more detailed error info
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Error response:', error.response.data);
          toast.error(error.response.data.message || 'Login failed');
        } else if (error.request) {
          console.error('Error request:', error.request);
          toast.error('No response from server. Please check your connection.');
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        toast.error('An unexpected error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-hr-dark-secondary rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Log in to your account</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-hr-dark border border-hr-dark-accent rounded-md text-white focus:outline-none focus:ring-2 focus:ring-hr-blue"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-hr-dark border border-hr-dark-accent rounded-md text-white focus:outline-none focus:ring-2 focus:ring-hr-blue"
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-hr-blue text-white font-semibold rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hr-blue disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>
          Don't have an account?{' '}
          <Link to="/register" className="text-hr-blue hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login; 