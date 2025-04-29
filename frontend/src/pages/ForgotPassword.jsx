import { useState } from 'react';
import { Link } from 'react-router-dom';
import TextInput from '../components/common/TextInput';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      setMessage(response.data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to send reset link. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-hr-dark-secondary p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-white">Reset Your Password</h1>
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      {message && <Alert type="success" message={message} className="mb-4" />}
      
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-6"
          placeholder="Enter the email address associated with your account"
        />
        
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
        
        <div className="mt-4 text-center text-gray-400">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="text-hr-blue hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword; 