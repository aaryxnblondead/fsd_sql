import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TextInput, Button, Alert } from '../components/common';

const TeacherLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Add role=teacher to the login request
      const loginResponse = await login({
        email: formData.email,
        password: formData.password,
        role: 'teacher'
      });
      
      console.log('Teacher login response:', loginResponse);
      
      if (loginResponse.success) {
        navigate('/teacher/dashboard');
      } else {
        setError(loginResponse.message || 'Invalid teacher credentials');
      }
    } catch (err) {
      console.error('Teacher login error:', err);
      setError('Authentication failed. Please verify you have teacher access.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-hr-dark-secondary p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-white">Teacher Login</h1>
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mb-4"
        />
        
        <TextInput
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="mb-6"
        />
        
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login as Teacher'}
        </Button>
        
        <div className="mt-4 text-center text-gray-400">
          <p>
            Not a teacher?{' '}
            <Link to="/login" className="text-hr-blue hover:underline">
              Regular login
            </Link>
          </p>
          <p className="mt-2">
            Forgot your password?{' '}
            <Link to="/forgot-password" className="text-hr-blue hover:underline">
              Reset it
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default TeacherLogin; 