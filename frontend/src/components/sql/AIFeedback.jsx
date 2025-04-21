import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Component that provides AI-powered feedback for failed SQL queries using OpenAI's ChatGPT
 */
function AIFeedback({ query, expectedOutput, actualOutput, error }) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (!query) return;

    const getOpenAIFeedback = async () => {
      setLoading(true);
      try {
        // Call the backend test endpoint that interfaces with OpenAI API
        const response = await axios.post('/api/openai/test-sql-feedback', {
          query,
          expectedOutput: JSON.stringify(expectedOutput),
          actualOutput: actualOutput ? JSON.stringify(actualOutput) : "No output produced",
          error: error || "No error message, but the query didn't produce the expected results"
        });
        
        setFeedback(response.data.feedback);
        
        // Check if this was a mock response
        if (response.data.isMock) {
          setUseMock(true);
        }
      } catch (err) {
        console.error('Error getting OpenAI feedback:', err);
        
        // Fallback to mock feedback if API call fails
        provideMockFeedback();
        setUseMock(true);
      } finally {
        setLoading(false);
      }
    };

    // Mock AI feedback for development or fallback
    const provideMockFeedback = () => {
      // Simulate API delay
      setTimeout(() => {
        // Generate helpful feedback based on the query and error
        let aiResponse = '';
        
        if (error && error.includes('syntax error')) {
          aiResponse = `Your SQL query has a syntax error. Check for missing semicolons, mismatched parentheses, or incorrect keywords. The specific error was: ${error}`;
        } else if (error && error.includes('no such column')) {
          aiResponse = `The column you're trying to access doesn't exist in the table. Double-check the column names and make sure they're spelled correctly. Error: ${error}`;
        } else if (error && error.includes('no such table')) {
          aiResponse = `The table you're trying to query doesn't exist in the database. Verify the table name and schema. Error: ${error}`;
        } else if (query.toLowerCase().includes('select *') && !error) {
          aiResponse = "Your query is executing, but you might want to be more specific than 'SELECT *'. Consider selecting only the columns you need for better performance and clarity.";
        } else if (!error && actualOutput && expectedOutput && actualOutput.length !== expectedOutput.length) {
          aiResponse = "Your query returned a different number of rows than expected. Check your WHERE clause conditions or JOINs to make sure you're filtering correctly.";
        } else if (error) {
          aiResponse = `There was an error executing your query: ${error}. Try reviewing your table names, column names, and syntax.`;
        } else {
          aiResponse = "Your query syntax looks correct, but the results don't match what's expected. Check your WHERE conditions, JOINs, and make sure you're selecting the right columns.";
        }
        
        setFeedback(aiResponse);
      }, 1000);
    };

    // Use OpenAI feedback
    getOpenAIFeedback();
    
  }, [query, expectedOutput, actualOutput, error]);

  return (
    <div className="bg-hr-dark-accent rounded-lg p-4 mt-4">
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          AI Query Analysis
        </h3>
        <span>{expanded ? '−' : '+'}</span>
      </div>
      
      {expanded && (
        <div className="mt-3">
          {loading ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing your query with ChatGPT...</span>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300">{feedback}</p>
              
              {useMock && (
                <div className="mt-2 p-2 bg-hr-dark rounded-md">
                  <p className="text-xs text-amber-400">
                    Note: This is a simulated AI response. For real ChatGPT-powered feedback, the backend needs to be configured with an OpenAI API key.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIFeedback; 