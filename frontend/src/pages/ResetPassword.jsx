import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import TextInput from '../components/common/TextInput';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`/api/auth/reset-password/${token}/verify`);
        setValidToken(true);
      } catch (err) {
        setError('Invalid or expired token. Please request a new password reset link.');
        setValidToken(false);
      } finally {
        setTokenChecked(true);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`/api/auth/reset-password/${token}`, { 
        password
      });
      
      setMessage(response.data.message || 'Password reset successful. You can now log in with your new password.');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to reset password. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!tokenChecked) {
    return (
      <div className="max-w-md mx-auto bg-hr-dark-secondary p-8 rounded-lg shadow-lg">
        <p className="text-white text-center">Verifying reset token...</p>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="max-w-md mx-auto bg-hr-dark-secondary p-8 rounded-lg shadow-lg">
        <Alert type="error" message={error} />
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-hr-blue hover:underline">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-hr-dark-secondary p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-white">Create New Password</h1>
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      {message && <Alert type="success" message={message} className="mb-4" />}
      
      <form onSubmit={handleSubmit}>
        <TextInput
          label="New Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-4"
          placeholder="Enter your new password"
        />
        
        <TextInput
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mb-6"
          placeholder="Confirm your new password"
        />
        
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword; 