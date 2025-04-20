import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function ResultsDisplay({ result, expectedOutput, isCorrect, error, feedback }) {
  const [activeTab, setActiveTab] = useState('results');
  
  // Parse JSON strings if they're not already objects
  const parseJsonIfString = (data) => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (err) {
        return data;
      }
    }
    return data;
  };
  
  const parsedResults = parseJsonIfString(result);
  const parsedExpected = parseJsonIfString(expectedOutput);
  
  // Generate table headers from results if available
  const getHeaders = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    return Object.keys(data[0]);
  };
  
  const resultHeaders = parsedResults && Array.isArray(parsedResults) ? getHeaders(parsedResults) : [];
  const expectedHeaders = parsedExpected && Array.isArray(parsedExpected) ? getHeaders(parsedExpected) : [];
  
  return (
    <div className="result-container">
      {/* Tabs */}
      <div className="flex border-b border-hr-dark-accent">
        <button 
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'results' ? 'bg-hr-dark-accent text-white' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('results')}
        >
          Results
        </button>
        
        {expectedOutput && (
          <button 
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'expected' ? 'bg-hr-dark-accent text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('expected')}
          >
            Expected
          </button>
        )}
        
        {feedback && (
          <button 
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'feedback' ? 'bg-hr-dark-accent text-white' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('feedback')}
          >
            AI Feedback
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {activeTab === 'results' && (
          <>
            {error ? (
              <div className="text-hr-red border border-hr-red bg-opacity-10 bg-hr-red p-4 rounded">
                <h3 className="font-bold mb-2">Error</h3>
                <p className="font-mono text-sm">{error}</p>
              </div>
            ) : parsedResults && Array.isArray(parsedResults) && parsedResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-hr-dark-accent">
                  <thead className="bg-hr-dark-accent">
                    <tr>
                      {resultHeaders.map((header, index) => (
                        <th 
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-hr-dark-secondary divide-y divide-hr-dark-accent">
                    {parsedResults.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {resultHeaders.map((header, cellIndex) => (
                          <td 
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                          >
                            {row[header] !== null && row[header] !== undefined ? String(row[header]) : 'NULL'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : parsedResults && !Array.isArray(parsedResults) ? (
              <div className="font-mono text-sm">
                <SyntaxHighlighter language="json" style={atomOneDark}>
                  {JSON.stringify(parsedResults, null, 2)}
                </SyntaxHighlighter>
              </div>
            ) : (
              <p className="text-gray-400">No results to display</p>
            )}
            
            {isCorrect !== undefined && (
              <div className={`mt-4 p-3 rounded-md ${isCorrect ? 'bg-green-900 bg-opacity-20 border border-green-700' : 'bg-red-900 bg-opacity-20 border border-red-700'}`}>
                <p className={`text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? '✓ Correct solution!' : '✗ Not quite right. Try again or check the AI feedback.'}
                </p>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'expected' && expectedOutput && (
          <>
            <h3 className="text-white text-lg font-medium mb-2">Expected Output</h3>
            {parsedExpected && Array.isArray(parsedExpected) && parsedExpected.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-hr-dark-accent">
                  <thead className="bg-hr-dark-accent">
                    <tr>
                      {expectedHeaders.map((header, index) => (
                        <th 
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-hr-dark-secondary divide-y divide-hr-dark-accent">
                    {parsedExpected.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {expectedHeaders.map((header, cellIndex) => (
                          <td 
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                          >
                            {row[header] !== null && row[header] !== undefined ? String(row[header]) : 'NULL'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="font-mono text-sm">
                <SyntaxHighlighter language="json" style={atomOneDark}>
                  {JSON.stringify(parsedExpected, null, 2)}
                </SyntaxHighlighter>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'feedback' && feedback && (
          <div className="prose prose-invert max-w-none">
            <h3 className="text-white text-lg font-medium mb-2">AI Feedback</h3>
            <div className="p-4 bg-hr-dark rounded-md">
              {feedback.split('\n').map((paragraph, index) => (
                <p key={index} className="my-2">{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsDisplay; 