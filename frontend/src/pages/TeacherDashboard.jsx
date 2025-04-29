import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

function TeacherDashboard() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageProgress: 0,
    studentsActive: 0,
    questionsAnswered: 0
  });
  
  // Fetch teacher data and student progress
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if user data is available and is a teacher
        if (!currentUser) {
          setError('User data not available. You may need to log in again.');
          return;
        }
        
        if (currentUser.role !== 'teacher') {
          setError('You do not have access to the teacher dashboard.');
          return;
        }
        
        console.log('Teacher data in dashboard:', currentUser);
        
        // Get students associated with this teacher
        const studentsResponse = await api.get('/api/users/students');
        const studentsData = studentsResponse.data.students || [];
        setStudents(studentsData);
        
        // Calculate stats
        const active = studentsData.filter(s => {
          const lastActive = new Date(s.lastActive || s.updatedAt);
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return lastActive > oneWeekAgo;
        }).length;
        
        const avgProgress = studentsData.length > 0 
          ? Math.round(studentsData.reduce((sum, s) => sum + (s.progress?.xp || 0), 0) / studentsData.length) 
          : 0;
        
        const totalAnswered = studentsData.reduce((sum, s) => sum + (s.progress?.questionsAnswered || 0), 0);
        
        setStats({
          totalStudents: studentsData.length,
          averageProgress: avgProgress,
          studentsActive: active,
          questionsAnswered: totalAnswered
        });
        
      } catch (error) {
        console.error('Error fetching teacher dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        toast.error('Failed to load teacher dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hr-blue mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading teacher dashboard...</p>
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
      {/* Teacher profile and stats */}
      <div className="md:col-span-1">
        <div className="bg-hr-dark-secondary rounded-lg p-6 shadow-md">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">👨‍🏫</div>
            <h2 className="text-xl font-bold">{currentUser.username}</h2>
            <p className="text-gray-400">{currentUser.email}</p>
            <p className="text-hr-blue mt-1">{currentUser.specialization}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <StatCard title="Students" value={stats.totalStudents} />
            <StatCard title="Active Students" value={stats.studentsActive} />
            <StatCard title="Avg. XP" value={stats.averageProgress} />
            <StatCard title="Questions Answered" value={stats.questionsAnswered} />
          </div>
        </div>
        
        <div className="bg-hr-dark-secondary rounded-lg p-6 shadow-md mt-6">
          <h3 className="font-bold mb-4">Teacher Actions</h3>
          <div className="space-y-3">
            <Link 
              to="/questions" 
              className="block w-full py-2 px-4 bg-hr-blue text-white text-center rounded-md hover:bg-opacity-90"
            >
              View Student Questions
            </Link>
            <Link 
              to="/challenges/create" 
              className="block w-full py-2 px-4 bg-green-700 text-white text-center rounded-md hover:bg-opacity-90"
            >
              Create Challenge
            </Link>
            <Link 
              to="/learning-modules/create" 
              className="block w-full py-2 px-4 bg-purple-700 text-white text-center rounded-md hover:bg-opacity-90"
            >
              Create Learning Module
            </Link>
          </div>
        </div>
      </div>
      
      {/* Student list and progress */}
      <div className="md:col-span-2">
        <div className="bg-hr-dark-secondary rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Your Students</h2>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search students..." 
                className="bg-hr-dark border border-hr-dark-accent rounded-md py-1 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-hr-blue"
              />
            </div>
          </div>
          
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-hr-dark-accent">
                <thead className="bg-hr-dark-accent">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Progress</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Last Active</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-hr-dark-secondary divide-y divide-hr-dark-accent">
                  {students.map(student => (
                    <tr key={student._id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-white">{student.username}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm text-white">Level {student.progress?.level || 1}</div>
                          <div className="w-full bg-hr-dark rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-hr-blue h-1.5 rounded-full" 
                              style={{ width: `${((student.progress?.xp || 0) % 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{student.progress?.xp || 0} XP</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">
                          {new Date(student.lastActive || student.updatedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          to={`/student/${student._id}`} 
                          className="text-hr-blue hover:text-hr-blue-600 mr-3"
                        >
                          View Progress
                        </Link>
                        <Link 
                          to={`/messages/student/${student._id}`} 
                          className="text-green-500 hover:text-green-400"
                        >
                          Message
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2">You don't have any students yet.</p>
              <p className="text-sm text-gray-500">
                Students will appear here once they register and join your class.
              </p>
            </div>
          )}
        </div>
        
        {/* Recent questions */}
        <div className="bg-hr-dark-secondary rounded-lg p-6 shadow-md mt-6">
          <h2 className="text-xl font-bold mb-4">Recent Questions</h2>
          
          {students.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-hr-dark p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="bg-hr-dark-accent h-8 w-8 rounded-full flex items-center justify-center text-xs mr-3">JS</div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-bold text-white">John Smith</h3>
                      <span className="text-gray-400 text-xs ml-3">2 hours ago</span>
                    </div>
                    <p className="text-gray-300 mt-1">How do I use JOIN in SQL to combine data from multiple tables?</p>
                    <div className="mt-2 flex">
                      <Link 
                        to="/questions/123" 
                        className="px-3 py-1 bg-hr-blue text-white text-xs rounded hover:bg-opacity-90 transition-colors"
                      >
                        Answer
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-hr-dark p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="bg-hr-dark-accent h-8 w-8 rounded-full flex items-center justify-center text-xs mr-3">AJ</div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-bold text-white">Amy Johnson</h3>
                      <span className="text-gray-400 text-xs ml-3">yesterday</span>
                    </div>
                    <p className="text-gray-300 mt-1">I'm having trouble with subqueries, can you help me understand when to use them?</p>
                    <div className="mt-2 flex">
                      <Link 
                        to="/questions/124" 
                        className="px-3 py-1 bg-hr-blue text-white text-xs rounded hover:bg-opacity-90 transition-colors"
                      >
                        Answer
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No recent questions. Check back later!</p>
          )}
          
          <div className="mt-4">
            <Link to="/questions" className="text-hr-blue hover:underline text-sm">
              View all questions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-hr-dark p-4 rounded-lg">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-xl font-bold text-white mt-1">{value}</div>
    </div>
  );
}

export default TeacherDashboard; 