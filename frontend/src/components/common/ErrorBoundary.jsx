import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could also log the error to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="p-4 bg-red-900 text-white rounded-md">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <details className="whitespace-pre-wrap">
            <summary className="cursor-pointer">
              {this.state.error?.toString() || 'Unknown error'}
            </summary>
            <div className="mt-2 text-sm font-mono bg-red-950 p-2 rounded overflow-auto max-h-40">
              {this.state.errorInfo?.componentStack || 'No stack trace available'}
            </div>
          </details>
          
          {this.props.fallback || (
            <button 
              className="mt-4 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          )}
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 