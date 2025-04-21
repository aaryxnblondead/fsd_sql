import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challengesAPI, submissionsAPI } from '../services/api';
import { toast } from 'react-toastify';
import SQLEditor from '../components/sql/SQLEditor';
import ResultsDisplay from '../components/sql/ResultsDisplay';
import AIFeedback from '../components/sql/AIFeedback';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ErrorBoundary from '../components/common/ErrorBoundary';

function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  
  // Fetch challenge data
  useEffect(() => {
    const fetchChallenge = async () => {
      setIsLoadingChallenge(true);
      try {
        const response = await challengesAPI.getChallengeById(id);
        setChallenge(response.data);
        setCode(response.data.initialCode || '-- Write your SQL query here');
      } catch (error) {
        console.error('Error fetching challenge:', error);
        toast.error('Failed to load challenge');
        navigate('/challenges');
      } finally {
        setIsLoadingChallenge(false);
      }
    };
    
    fetchChallenge();
  }, [id, navigate]);
  
  // Handle code change
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };
  
  // Handle query execution
  const handleExecute = async () => {
    if (!code.trim()) {
      toast.error('Please write a SQL query before executing');
      return;
    }
    
    setIsExecuting(true);
    setExecutionResult(null);
    
    try {
      const response = await submissionsAPI.submitSolution(id, code);
      setExecutionResult({
        result: response.data.result.output,
        expectedOutput: response.data.result.expectedOutput,
        isCorrect: response.data.isCorrect,
        error: response.data.result.error,
        feedback: response.data.feedback?.aiGeneratedFeedback
      });
      
      if (response.data.isCorrect) {
        toast.success('Correct solution! 🎉');
      }
    } catch (error) {
      console.error('Execution error:', error);
      toast.error('Error executing query');
      setExecutionResult({
        error: 'Failed to execute query. Please try again.'
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Toggle hint visibility
  const handleToggleHint = () => {
    setShowHint(!showHint);
  };
  
  // Toggle schema visibility
  const handleToggleSchema = () => {
    setShowSchema(!showSchema);
  };
  
  if (isLoadingChallenge) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hr-blue mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading challenge...</p>
        </div>
      </div>
    );
  }
  
  if (!challenge) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold text-red-500">Challenge not found</h2>
        <button
          onClick={() => navigate('/challenges')}
          className="mt-4 px-4 py-2 bg-hr-blue text-white rounded-md hover:bg-opacity-90"
        >
          Back to Challenges
        </button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Challenge details */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-hr-dark-secondary rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl font-bold">{challenge.title}</h1>
              <div className="flex items-center mt-1 space-x-2">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  challenge.difficulty === 'easy' ? 'bg-green-900 text-green-400' :
                  challenge.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-400' :
                  'bg-red-900 text-red-400'
                }`}>
                  {challenge.difficulty}
                </span>
                <span className="px-2 py-0.5 bg-hr-dark-accent rounded text-xs text-gray-300">
                  {challenge.category}
                </span>
              </div>
            </div>
            <span className="px-2 py-1 bg-hr-dark rounded text-sm text-gray-300">
              {challenge.reward?.xp || 0} XP
            </span>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300">{challenge.description}</p>
          </div>
          
          <div className="mt-6 space-y-4">
            <button
              onClick={handleToggleSchema}
              className="w-full py-2 px-4 bg-hr-dark-accent text-white font-medium rounded-md hover:bg-opacity-90 flex justify-between items-center"
            >
              <span>Database Schema</span>
              <span>{showSchema ? '−' : '+'}</span>
            </button>
            
            {showSchema && (
              <div className="bg-hr-dark rounded-md p-3 overflow-auto max-h-80">
                <SyntaxHighlighter language="sql" style={atomOneDark} wrapLongLines={true}>
                  {challenge.schema}
                </SyntaxHighlighter>
              </div>
            )}
            
            {challenge.hints && challenge.hints.length > 0 && (
              <>
                <button
                  onClick={handleToggleHint}
                  className="w-full py-2 px-4 bg-hr-dark-accent text-white font-medium rounded-md hover:bg-opacity-90 flex justify-between items-center"
                >
                  <span>Show Hint{challenge.hints.length > 1 ? 's' : ''}</span>
                  <span>{showHint ? '−' : '+'}</span>
                </button>
                
                {showHint && (
                  <div className="bg-hr-dark rounded-md p-4">
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      {challenge.hints.map((hint, index) => (
                        <li key={index}>
                          {hint.text}
                          {hint.cost > 0 && <span className="text-xs text-gray-400 ml-2">(-{hint.cost} XP)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* SQL editor and results */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-hr-dark-secondary rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-bold mb-4">SQL Editor</h2>
          
          <ErrorBoundary>
            <SQLEditor
              initialCode={code}
              onCodeChange={handleCodeChange}
              onExecute={handleExecute}
            />
          </ErrorBoundary>
        </div>
        
        {(isExecuting || executionResult) && (
          <div className="bg-hr-dark-secondary rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-bold mb-4">Result</h2>
            
            {isExecuting ? (
              <div className="flex items-center space-x-3 text-gray-400">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-hr-blue"></div>
                <span>Executing query...</span>
              </div>
            ) : (
              <ResultsDisplay
                result={executionResult?.result}
                expectedOutput={executionResult?.expectedOutput}
                isCorrect={executionResult?.isCorrect}
                error={executionResult?.error}
                feedback={executionResult?.feedback}
              />
            )}
          </div>
        )}
        
        {!isExecuting && executionResult && !executionResult.isCorrect && (
          <ErrorBoundary>
            <AIFeedback 
              query={code}
              expectedOutput={executionResult?.expectedOutput}
              actualOutput={executionResult?.result}
              error={executionResult?.error}
            />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}

export default ChallengeDetail; 