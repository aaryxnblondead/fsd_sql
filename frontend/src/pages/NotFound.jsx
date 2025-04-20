import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-6xl font-bold text-hr-blue mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex space-x-4">
        <Link 
          to="/" 
          className="px-4 py-2 bg-hr-blue text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Go Home
        </Link>
        <Link 
          to="/challenges" 
          className="px-4 py-2 bg-hr-dark-accent text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Browse Challenges
        </Link>
      </div>
    </div>
  );
}

export default NotFound; 