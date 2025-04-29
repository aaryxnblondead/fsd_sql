import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { discussionsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function DiscussionList() {
  const [discussions, setDiscussions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({
    tag: '',
    challenge: '',
    solved: ''
  });
  const { isAuthenticated } = useAuth();

  // Fetch discussions on component mount and when filters or pagination change
  useEffect(() => {
    const fetchDiscussions = async () => {
      setIsLoading(true);
      try {
        const response = await discussionsAPI.getAllDiscussions(
          pagination.page,
          pagination.limit,
          filters
        );
        
        setDiscussions(response.data.discussions);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Error fetching discussions:', error);
        toast.error('Failed to load discussions');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDiscussions();
  }, [pagination.page, pagination.limit, filters]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    // Reset page to 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  if (isLoading && discussions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hr-blue mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading discussions...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Community Discussions</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Tag filter */}
          <select
            name="tag"
            value={filters.tag}
            onChange={handleFilterChange}
            className="bg-hr-dark-accent text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hr-blue"
          >
            <option value="">All Tags</option>
            <option value="beginner">Beginner</option>
            <option value="advanced">Advanced</option>
            <option value="query">Query Help</option>
            <option value="solution">Solution</option>
          </select>
          
          {/* Solved filter */}
          <select
            name="solved"
            value={filters.solved}
            onChange={handleFilterChange}
            className="bg-hr-dark-accent text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hr-blue"
          >
            <option value="">All Statuses</option>
            <option value="true">Solved</option>
            <option value="false">Unsolved</option>
          </select>
        </div>
      </div>
      
      {/* New discussion button */}
      {isAuthenticated && (
        <div className="mb-6">
          <Link 
            to="/discussions/new" 
            className="bg-hr-blue text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
          >
            Create New Discussion
          </Link>
        </div>
      )}
      
      {/* Discussions list */}
      <div className="space-y-4">
        {discussions.length > 0 ? (
          discussions.map(discussion => (
            <div key={discussion._id} className="bg-hr-dark-secondary rounded-lg p-4 hover:bg-opacity-80 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link to={`/discussions/${discussion._id}`} className="text-xl font-semibold hover:text-hr-blue transition-colors">
                    {discussion.title}
                  </Link>
                  
                  <div className="flex items-center mt-2 space-x-2">
                    {discussion.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 text-xs bg-hr-dark rounded-full text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                    
                    {discussion.isSolved && (
                      <span className="px-2 py-1 text-xs bg-green-900 text-green-400 rounded-full">
                        Solved
                      </span>
                    )}
                    
                    {discussion.challenge && (
                      <Link 
                        to={`/challenges/${discussion.challenge._id}`}
                        className="px-2 py-1 text-xs bg-hr-dark-accent rounded-full text-gray-300 hover:bg-opacity-80"
                      >
                        {discussion.challenge.title}
                      </Link>
                    )}
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-400">
                    <span>by {discussion.user.username}</span>
                    <span className="mx-2">•</span>
                    <span>{formatRelativeTime(discussion.createdAt)}</span>
                    <span className="mx-2">•</span>
                    <span>{discussion.comments.length} comments</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center ml-4">
                  <div className="text-center">
                    <div className="text-xl font-bold">{discussion.likes.length}</div>
                    <div className="text-xs text-gray-400">likes</div>
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-xl font-bold">{discussion.views}</div>
                    <div className="text-xs text-gray-400">views</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-hr-dark-secondary rounded-lg">
            <p className="text-gray-400">No discussions found.</p>
            {isAuthenticated ? (
              <p className="mt-2">
                <Link to="/discussions/new" className="text-hr-blue hover:underline">
                  Start the first discussion!
                </Link>
              </p>
            ) : (
              <p className="mt-2">
                <Link to="/login" className="text-hr-blue hover:underline">
                  Log in to start a discussion
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {discussions.length > 0 && pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 rounded bg-hr-dark-accent text-white disabled:opacity-50"
            >
              Previous
            </button>
            
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${
                  pagination.page === i + 1 ? 'bg-hr-blue text-white' : 'bg-hr-dark-accent text-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 rounded bg-hr-dark-accent text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiscussionList; 