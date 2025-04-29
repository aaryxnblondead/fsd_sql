import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role is user
  const [specialization, setSpecialization] = useState(''); // For teacher role
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setError(null);
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Teacher validation
    if (role === 'teacher' && !specialization) {
      toast.error('Please specify your specialization');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Submitting registration form', { username, email, role });
      const result = await register(username, email, password, role, specialization);
      
      console.log('Registration result:', result);
      
      if (result.success) {
        toast.success(`Registration successful as ${role === 'teacher' ? 'teacher' : 'student'}!`);
        
        // Small delay to ensure state updates before navigation
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setError(result.message || 'Registration failed');
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-hr-dark-secondary rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Create an account</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-700 rounded-md text-red-200">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-hr-dark border border-hr-dark-accent rounded-md text-white focus:outline-none focus:ring-2 focus:ring-hr-blue"
            placeholder="Choose a username"
            required
          />
        </div>
        
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
          <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
            Account Type
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === 'user'}
                onChange={() => setRole('user')}
                className="form-radio h-4 w-4 text-hr-blue"
              />
              <span className="ml-2 text-white">Student</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={role === 'teacher'}
                onChange={() => setRole('teacher')}
                className="form-radio h-4 w-4 text-hr-blue"
              />
              <span className="ml-2 text-white">Teacher</span>
            </label>
          </div>
        </div>
        
        {role === 'teacher' && (
          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-gray-300 mb-1">
              Specialization
            </label>
            <select
              id="specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 bg-hr-dark border border-hr-dark-accent rounded-md text-white focus:outline-none focus:ring-2 focus:ring-hr-blue"
              required={role === 'teacher'}
            >
              <option value="">Select your specialization</option>
              <option value="sql-basics">SQL Basics</option>
              <option value="database-design">Database Design</option>
              <option value="advanced-queries">Advanced Queries</option>
              <option value="performance">Database Performance</option>
              <option value="data-analysis">Data Analysis</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}
        
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
            placeholder="Create a password"
            required
          />
          <p className="mt-1 text-xs text-gray-400">Must be at least 6 characters</p>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 bg-hr-dark border border-hr-dark-accent rounded-md text-white focus:outline-none focus:ring-2 focus:ring-hr-blue"
            placeholder="Confirm your password"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-hr-blue text-white font-semibold rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hr-blue disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="text-hr-blue hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register; 