import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { challengesAPI } from '../services/api';
import { toast } from 'react-toastify';

function ChallengeList() {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({
    difficulty: '',
    category: ''
  });
  
  // Fetch challenges on component mount and when filters or pagination change
  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoading(true);
      try {
        const response = await challengesAPI.getAllChallenges(
          pagination.page,
          pagination.limit,
          filters
        );
        
        setChallenges(response.data.challenges);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        toast.error('Failed to load challenges');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChallenges();
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
  
  // Get difficulty badge class
  const getDifficultyBadgeClass = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-900 text-green-400';
      case 'medium':
        return 'bg-yellow-900 text-yellow-400';
      case 'hard':
        return 'bg-red-900 text-red-400';
      default:
        return 'bg-gray-900 text-gray-400';
    }
  };
  
  if (isLoading && challenges.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hr-blue mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading challenges...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">SQL Challenges</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Difficulty filter */}
          <select
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
            className="bg-hr-dark-accent text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hr-blue"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          
          {/* Category filter */}
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="bg-hr-dark-accent text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hr-blue"
          >
            <option value="">All Categories</option>
            <option value="basics">Basics</option>
            <option value="joins">Joins</option>
            <option value="subqueries">Subqueries</option>
            <option value="aggregation">Aggregation</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
      
      {/* Challenges list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.length > 0 ? (
          challenges.map(challenge => (
            <div key={challenge._id} className="bg-hr-dark-secondary rounded-lg overflow-hidden shadow-md">
              <div className="p-5">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyBadgeClass(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="px-2 py-0.5 bg-hr-dark-accent rounded text-xs text-gray-300">
                      {challenge.category}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">{challenge.reward?.xp || 0} XP</span>
                </div>
                
                <h2 className="text-lg font-bold mb-2">{challenge.title}</h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{challenge.description}</p>
                
                <Link 
                  to={`/challenges/${challenge._id}`}
                  className="block w-full text-center py-2 px-4 bg-hr-blue text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Solve Challenge
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-400">No challenges found. Try changing your filters.</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {challenges.length > 0 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-hr-dark-accent rounded-l-md text-white disabled:opacity-50"
            >
              Previous
            </button>
            
            <div className="px-4 py-1 bg-hr-dark text-white">
              Page {pagination.page} of {pagination.pages}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 bg-hr-dark-accent rounded-r-md text-white disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default ChallengeList; 