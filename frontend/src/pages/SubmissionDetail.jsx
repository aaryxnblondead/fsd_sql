import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { submissionsAPI } from '../services/api';
import { toast } from 'react-toastify';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ResultsDisplay from '../components/sql/ResultsDisplay';

function SubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch submission details
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      setIsLoading(true);
      try {
        const response = await submissionsAPI.getSubmission(id);
        setSubmission(response.data);
      } catch (error) {
        console.error('Error fetching submission:', error);
        toast.error('Failed to load submission details');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubmissionDetails();
  }, [id, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hr-blue mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading submission details...</p>
        </div>
      </div>
    );
  }
  
  if (!submission) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold text-red-500">Submission not found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-hr-blue text-white rounded-md hover:bg-opacity-90"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Submission Details</h1>
          <p className="text-gray-400">
            {new Date(submission.createdAt).toLocaleDateString()} at {new Date(submission.createdAt).toLocaleTimeString()}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-4">
          <Link
            to={`/challenges/${submission.challenge._id}`}
            className="px-4 py-2 bg-hr-blue text-white rounded-md hover:bg-opacity-90"
          >
            Try Again
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-hr-dark-accent text-white rounded-md hover:bg-opacity-90"
          >
            Back
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenge info */}
        <div className="lg:col-span-1">
          <div className="bg-hr-dark-secondary rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4">{submission.challenge.title}</h2>
            
            <div className="flex items-center mb-4 space-x-2">
              <span className={`px-2 py-0.5 rounded text-xs ${
                submission.challenge.difficulty === 'easy' ? 'bg-green-900 text-green-400' :
                submission.challenge.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-400' :
                'bg-red-900 text-red-400'
              }`}>
                {submission.challenge.difficulty}
              </span>
              <span className="px-2 py-0.5 bg-hr-dark-accent rounded text-xs text-gray-300">
                {submission.challenge.category}
              </span>
            </div>
            
            <div className={`p-3 rounded-md ${submission.isCorrect ? 'bg-green-900 bg-opacity-20 border border-green-700' : 'bg-red-900 bg-opacity-20 border border-red-700'}`}>
              <p className={`text-sm font-medium ${submission.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {submission.isCorrect ? '✓ Correct solution' : '✗ Incorrect solution'}
              </p>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Submission Info</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-400">Attempt</div>
                <div className="text-white">{submission.attempts}</div>
                
                <div className="text-gray-400">Execution Time</div>
                <div className="text-white">{submission.result.executionTime || 0} ms</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Code and results */}
        <div className="lg:col-span-2 space-y-6">
          {/* SQL code */}
          <div className="bg-hr-dark-secondary rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-bold mb-4">Your SQL Query</h2>
            
            <div className="bg-hr-dark rounded-md overflow-hidden">
              <SyntaxHighlighter language="sql" style={atomOneDark} showLineNumbers={true}>
                {submission.code}
              </SyntaxHighlighter>
            </div>
          </div>
          
          {/* Results */}
          <div className="bg-hr-dark-secondary rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-bold mb-4">Results</h2>
            
            <ResultsDisplay
              result={submission.result.output}
              expectedOutput={submission.result.expectedOutput}
              isCorrect={submission.isCorrect}
              error={submission.result.error}
              feedback={submission.feedback?.aiGeneratedFeedback}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmissionDetail; 