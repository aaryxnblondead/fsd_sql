import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submissionsAPI, challengesAPI } from '../services/api';
import { toast } from 'react-toastify';

function Dashboard() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [stats, setStats] = useState({
    completedChallenges: 0,
    totalAttempts: 0,
    successRate: 0,
    xp: 0,
    level: 1
  });
  const [recommendedChallenges, setRecommendedChallenges] = useState([]);
  
  // Fetch user data and stats
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Check if user data is available
        if (!currentUser) {
          console.error('Current user data is not available');
          setError('User data not available. You may need to log in again.');
          toast.error('User data not available. You may need to log in again.');
          return;
        }

        console.log('Current user in Dashboard:', currentUser); // Log the user data
        
        // Fetch recent submissions
        const submissionsResponse = await submissionsAPI.getUserSubmissions(1, 5);
        console.log('Recent submissions data:', submissionsResponse); // Log the response
        
        if (submissionsResponse && submissionsResponse.data && submissionsResponse.data.submissions) {
          setRecentSubmissions(submissionsResponse.data.submissions);
        } else {
          console.error('Unexpected submissions response format:', submissionsResponse);
          setRecentSubmissions([]);
        }
        
        // Fetch recommendations (challenges not completed)
        const allChallengesResponse = await challengesAPI.getAllChallenges(1, 10);
        
        // Safely access completedChallenges
        const completedChallengeIds = currentUser.progress?.completedChallenges || [];
        
        // Filter out completed challenges and limit to 3
        const recommended = allChallengesResponse.data.challenges
          .filter(challenge => !completedChallengeIds.includes(challenge._id))
          .slice(0, 3);
        
        setRecommendedChallenges(recommended);
        
        // Set stats
        setStats({
          completedChallenges: completedChallengeIds.length,
          totalAttempts: submissionsResponse.data.pagination.total,
          successRate: calculateSuccessRate(submissionsResponse.data.submissions),
          xp: currentUser.progress?.xp || 0,
          level: currentUser.progress?.level || 1
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // More detailed error logging
        if (error.response) {
          console.error('API Error:', {
            status: error.response.status,
            data: error.response.data
          });
        }
        
        setError('Failed to load dashboard data. Please try again later.');
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  // Calculate success rate from submissions
  const calculateSuccessRate = (submissions) => {
    if (!submissions || submissions.length === 0) return 0;
    
    const correctSubmissions = submissions.filter(sub => sub.isCorrect).length;
    return Math.round((correctSubmissions / submissions.length) * 100);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hr-blue mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center max-w-md">
          <div className="text-hr-red text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-hr-blue text-white rounded-md hover:bg-opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* User profile and stats */}
      <div className="md:col-span-1">
        <div className="bg-hr-dark-secondary rounded-lg p-6 shadow-md">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">{currentUser.username}</h2>
            <p className="text-gray-400">{currentUser.email}</p>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-gray-300">Level {stats.level}</span>
              <span className="text-gray-300">{stats.xp} XP</span>
            </div>
            <div className="w-full bg-hr-dark rounded-full h-2.5">
              <div 
                className="bg-hr-blue h-2.5 rounded-full" 
                style={{ width: `${(stats.xp % 100) / 100 * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <StatCard title="Completed" value={stats.completedChallenges} />
            <StatCard title="Success Rate" value={`${stats.successRate}%`} />
            <StatCard title="Total Attempts" value={stats.totalAttempts} />
            <StatCard title="XP Earned" value={stats.xp} />
          </div>
          
          <div className="mt-6">
            <Link 
              to="/challenges" 
              className="w-full block text-center py-2 px-4 bg-hr-blue text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors"
            >
              Practice More
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main dashboard content */}
      <div className="md:col-span-2">
        {/* Recommended challenges */}
        <div className="bg-hr-dark-secondary rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Recommended Challenges</h2>
          
          {recommendedChallenges.length > 0 ? (
            <div className="space-y-4">
              {recommendedChallenges.map(challenge => (
                <div key={challenge._id} className="bg-hr-dark p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white">{challenge.title}</h3>
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
                    <Link 
                      to={`/challenges/${challenge._id}`}
                      className="px-3 py-1 bg-hr-blue text-white text-sm rounded hover:bg-opacity-90 transition-colors"
                    >
                      Solve
                    </Link>
                  </div>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{challenge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No challenges available. Check back later!</p>
          )}
          
          <div className="mt-4">
            <Link to="/challenges" className="text-hr-blue hover:underline text-sm">
              View all challenges →
            </Link>
          </div>
        </div>
        
        {/* Recent submissions */}
        <div className="bg-hr-dark-secondary rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Submissions</h2>
          
          {recentSubmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-hr-dark-accent">
                <thead className="bg-hr-dark-accent">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Challenge</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-hr-dark-secondary divide-y divide-hr-dark-accent">
                  {recentSubmissions.map(submission => (
                    <tr key={submission._id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {submission.challenge?.title || 'Unknown Challenge'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {submission.challenge?.category || 'No category'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          submission.isCorrect ? 'bg-green-900 text-green-400' : 
                          (submission.status === 'failed' || submission.result?.success === false)
                            ? 'bg-red-900 text-red-400' 
                            : 'bg-yellow-900 text-yellow-400'
                        }`}>
                          {submission.isCorrect ? 'Correct' : 
                           (submission.status === 'failed' || submission.result?.success === false)
                              ? 'Incorrect' : submission.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {submission.createdAt 
                          ? new Date(submission.createdAt).toLocaleDateString() 
                          : 'Unknown date'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <Link 
                          to={`/submissions/${submission._id}`} 
                          className="text-hr-blue hover:text-hr-blue-600"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">No submissions yet. Try solving some challenges!</p>
          )}
          
          <div className="mt-4">
            <Link to="/challenges" className="px-4 py-2 bg-hr-dark text-white text-sm rounded hover:bg-hr-dark-accent transition-colors">
              Start New Challenge
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat card component
function StatCard({ title, value }) {
  return (
    <div className="bg-hr-dark p-3 rounded-lg text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{title}</p>
    </div>
  );
}

export default Dashboard; 