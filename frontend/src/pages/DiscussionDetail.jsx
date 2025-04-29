import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { discussionsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function DiscussionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [discussion, setDiscussion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentRef = useRef(null);

  // Fetch discussion details
  useEffect(() => {
    const fetchDiscussion = async () => {
      setIsLoading(true);
      try {
        const response = await discussionsAPI.getDiscussion(id);
        setDiscussion(response.data);
      } catch (error) {
        console.error('Error fetching discussion:', error);
        toast.error('Failed to load discussion details');
        navigate('/discussions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscussion();
  }, [id, navigate]);

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

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      const response = await discussionsAPI.addComment(id, commentContent.trim());
      
      // Update discussion with new comment
      setDiscussion(prev => ({
        ...prev,
        comments: [...prev.comments, response.data]
      }));
      
      // Clear comment input
      setCommentContent('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle marking a comment as answer
  const handleMarkAsAnswer = async (commentId) => {
    try {
      const response = await discussionsAPI.markAsAnswer(id, commentId);
      setDiscussion(response.data);
      toast.success('Comment marked as answer');
    } catch (error) {
      console.error('Error marking comment as answer:', error);
      toast.error('Failed to mark comment as answer');
    }
  };

  // Handle like/unlike discussion
  const handleLikeDiscussion = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to like discussions');
      return;
    }
    
    try {
      const response = await discussionsAPI.toggleLikeDiscussion(id);
      
      setDiscussion(prev => ({
        ...prev,
        likes: response.data.isLiked 
          ? [...prev.likes, currentUser.id]
          : prev.likes.filter(userId => userId !== currentUser.id)
      }));
    } catch (error) {
      console.error('Error liking discussion:', error);
      toast.error('Failed to like discussion');
    }
  };

  // Handle like/unlike comment
  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.info('Please log in to like comments');
      return;
    }
    
    try {
      const response = await discussionsAPI.toggleLikeComment(id, commentId);
      
      setDiscussion(prev => ({
        ...prev,
        comments: prev.comments.map(comment => 
          comment._id === commentId 
            ? { 
                ...comment, 
                likes: response.data.isLiked 
                  ? [...comment.likes, currentUser.id]
                  : comment.likes.filter(userId => userId !== currentUser.id)
              }
            : comment
        )
      }));
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment');
    }
  };

  // Check if content contains SQL code
  const formatContent = (content) => {
    // Simple regex to detect SQL code blocks
    const sqlRegex = /```sql\s*([\s\S]*?)\s*```/g;
    
    // Split content by SQL code blocks
    const parts = content.split(sqlRegex);
    
    if (parts.length <= 1) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }
    
    // Rebuild content with syntax highlighting
    const result = [];
    let i = 0;
    let match;
    
    // Reset regex
    sqlRegex.lastIndex = 0;
    
    while ((match = sqlRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > i) {
        result.push(<p key={`text-${i}`} className="whitespace-pre-wrap">{content.substring(i, match.index)}</p>);
      }
      
      // Add code block with syntax highlighting
      result.push(
        <div key={`code-${match.index}`} className="my-4">
          <SyntaxHighlighter
            language="sql"
            style={atomOneDark}
            className="rounded-md p-4"
          >
            {match[1]}
          </SyntaxHighlighter>
        </div>
      );
      
      i = match.index + match[0].length;
    }
    
    // Add remaining text
    if (i < content.length) {
      result.push(<p key={`text-${i}`} className="whitespace-pre-wrap">{content.substring(i)}</p>);
    }
    
    return result;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hr-blue mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold text-red-500">Discussion not found</h2>
        <button
          onClick={() => navigate('/discussions')}
          className="mt-4 px-4 py-2 bg-hr-blue text-white rounded-md hover:bg-opacity-90"
        >
          Back to Discussions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Discussion header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">{discussion.title}</h1>
          
          <button
            onClick={() => navigate('/discussions')}
            className="px-3 py-1 bg-hr-dark-accent text-white rounded hover:bg-opacity-90"
          >
            Back
          </button>
        </div>
        
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
          <span>Posted by {discussion.user.username}</span>
          <span className="mx-2">•</span>
          <span>{formatRelativeTime(discussion.createdAt)}</span>
          <span className="mx-2">•</span>
          <span>{discussion.views} views</span>
        </div>
      </div>
      
      {/* Discussion content */}
      <div className="bg-hr-dark-secondary p-6 rounded-lg mb-6">
        <div className="flex items-center space-x-4">
          {/* Voting */}
          <div className="flex flex-col items-center">
            <button 
              onClick={handleLikeDiscussion}
              className="p-2 text-gray-400 hover:text-hr-blue"
              disabled={!isAuthenticated}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className="text-lg font-bold">{discussion.likes.length}</span>
          </div>
          
          {/* Content */}
          <div className="flex-1 text-gray-200">
            {formatContent(discussion.content)}
          </div>
        </div>
      </div>
      
      {/* Comments section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">
          {discussion.comments.length} {discussion.comments.length === 1 ? 'Comment' : 'Comments'}
        </h2>
        
        {discussion.comments.length > 0 ? (
          <div className="space-y-4">
            {discussion.comments.map(comment => (
              <div 
                key={comment._id} 
                className={`p-4 rounded-lg ${
                  comment.isAnswer 
                    ? 'bg-green-900 bg-opacity-20 border border-green-700' 
                    : 'bg-hr-dark-secondary'
                }`}
                id={`comment-${comment._id}`}
              >
                <div className="flex items-start space-x-4">
                  {/* Voting */}
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={() => handleLikeComment(comment._id)}
                      className="p-2 text-gray-400 hover:text-hr-blue"
                      disabled={!isAuthenticated}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <span className="text-sm font-bold">{comment.likes.length}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{comment.user.username}</span>
                        <span className="text-xs text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      
                      {/* Mark as answer button (only shown to discussion owner) */}
                      {isAuthenticated && currentUser.id === discussion.user._id && (
                        <button 
                          onClick={() => handleMarkAsAnswer(comment._id)}
                          className={`text-xs px-2 py-1 rounded ${
                            comment.isAnswer 
                              ? 'bg-green-700 text-white' 
                              : 'bg-hr-dark text-gray-300 hover:bg-hr-dark-accent'
                          }`}
                        >
                          {comment.isAnswer ? 'Accepted Answer' : 'Mark as Answer'}
                        </button>
                      )}
                    </div>
                    
                    <div className="text-gray-200">
                      {formatContent(comment.content)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-hr-dark-secondary rounded-lg">
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
      
      {/* Add comment form */}
      {isAuthenticated ? (
        <div className="bg-hr-dark-secondary p-4 rounded-lg" ref={commentRef}>
          <h3 className="text-lg font-semibold mb-4">Add a Comment</h3>
          
          <form onSubmit={handleSubmitComment}>
            <div className="mb-4">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Type your comment here... You can use ```sql ... ``` for SQL code blocks."
                className="w-full px-3 py-2 bg-hr-dark border border-hr-dark-accent rounded-md text-white focus:outline-none focus:ring-2 focus:ring-hr-blue"
                rows={6}
                required
              ></textarea>
              <p className="text-xs text-gray-400 mt-1">
                Formatting tip: Wrap SQL code blocks with ```sql ... ``` for syntax highlighting
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="px-4 py-2 bg-hr-blue text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
              >
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center py-6 bg-hr-dark-secondary rounded-lg">
          <p className="text-gray-400">
            <Link to="/login" className="text-hr-blue hover:underline">Log in</Link> to add a comment
          </p>
        </div>
      )}
    </div>
  );
}

export default DiscussionDetail; 