import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { discussionsAPI, challengesAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function CreateDiscussion() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    challenge: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState(null);
  
  // Available tags
  const availableTags = ['beginner', 'advanced', 'query', 'solution', 'help', 'discussion'];
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to create a discussion');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch challenges for dropdown
  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoadingChallenges(true);
      try {
        const response = await challengesAPI.getAllChallenges(1, 100);
        setChallenges(response.data.challenges);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        setError('Failed to load challenges. Some functionality may be limited.');
      } finally {
        setIsLoadingChallenges(false);
      }
    };
    
    fetchChallenges();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle tag input
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };
  
  // Add tag to the list
  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    
    if (!tag) return;
    
    if (formData.tags.includes(tag)) {
      toast.info('Tag already added');
      return;
    }
    
    if (formData.tags.length >= 5) {
      toast.info('Maximum 5 tags allowed');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
    
    setTagInput('');
  };
  
  // Remove tag from the list
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Add a suggested tag
  const handleSuggestedTagClick = (tag) => {
    if (formData.tags.includes(tag)) {
      // If already added, remove it
      handleRemoveTag(tag);
    } else if (formData.tags.length < 5) {
      // Add it if we have less than 5 tags
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    } else {
      toast.info('Maximum 5 tags allowed');
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const discussionData = {
        ...formData,
        challenge: formData.challenge || null
      };
      
      const response = await discussionsAPI.createDiscussion(discussionData);
      
      toast.success('Discussion created successfully!');
      navigate(`/discussions/${response.data._id}`);
    } catch (error) {
      console.error('Error creating discussion:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create discussion. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Create New Discussion</h1>
        
        <button
          onClick={() => navigate('/discussions')}
          className="px-3 py-1 bg-hr-dark-accent text-white rounded hover:bg-opacity-90"
        >
          Cancel
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-md p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      <div className="bg-hr-dark-secondary rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-hr-dark border border-hr-dark-accent rounded-md text-white focus:outline-none focus:ring-2 focus:ring-hr-blue"
              placeholder="Enter a descriptive title"
              required
            />
          </div>
          
          {/* Related Challenge (Optional) */}
          <div className="mb-4">
            <label htmlFor="challenge" className="block text-sm font-medium text-gray-300 mb-1">
              Related Challenge (Optional)
            </label>
            <select
              id="challenge"
              name="challenge"
              value={formData.challenge}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-hr-dark border border-hr-dark-accent rounded-md text-white focus:outline-none focus:ring-2 focus:ring-hr-blue"
              disabled={isLoadingChallenges}
            >
              <option value="">None (General Discussion)</option>
              {challenges.map(challenge => (
                <option key={challenge._id} value={challenge._id}>
                  {challenge.title} ({challenge.difficulty})
                </option>
              ))}
            </select>
          </div>
          
          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tags (up to 5)
            </label>
            
            {/* Tag input */}
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 bg-hr-dark border border-hr-dark-accent rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-hr-blue"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-hr-dark-accent text-white rounded-r-md hover:bg-opacity-90"
              >
                Add
              </button>
            </div>
            
            {/* Suggested tags */}
            <div className="mt-2">
              <span className="text-xs text-gray-400 mr-2">Suggested:</span>
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSuggestedTagClick(tag)}
                  className={`mr-2 mb-2 px-2 py-1 text-xs rounded-full ${
                    formData.tags.includes(tag)
                      ? 'bg-hr-blue text-white'
                      : 'bg-hr-dark text-gray-300 hover:bg-hr-dark-accent'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            {/* Selected tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap mt-2">
                {formData.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="mr-2 mb-2 px-2 py-1 bg-hr-blue text-white text-xs rounded-full flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
              Content*
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={12}
              className="w-full px-3 py-2 bg-hr-dark border border-hr-dark-accent rounded-md text-white focus:outline-none focus:ring-2 focus:ring-hr-blue"
              placeholder="Describe your question or share your thoughts... You can use ```sql ... ``` for SQL code blocks."
              required
            ></textarea>
            <p className="text-xs text-gray-400 mt-1">
              Formatting tip: Wrap SQL code blocks with ```sql ... ``` for syntax highlighting
            </p>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-hr-blue text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Discussion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDiscussion; 