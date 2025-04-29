import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Components
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import LessonEditor from '../components/modules/LessonEditor';

const CreateLearningModule = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [module, setModule] = useState({
    title: '',
    description: '',
    category: 'sql-basics',
    difficulty: 'beginner',
    imageUrl: '',
    tags: [],
    isPublished: false,
    lessons: []
  });
  const [tagInput, setTagInput] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Module Info, 2: Lessons

  // Categories and difficulty levels
  const categories = [
    { value: 'sql-basics', label: 'SQL Basics' },
    { value: 'joins', label: 'Joins' },
    { value: 'subqueries', label: 'Subqueries' },
    { value: 'aggregation', label: 'Aggregation Functions' },
    { value: 'advanced', label: 'Advanced SQL' },
    { value: 'other', label: 'Other' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModule({
      ...module,
      [name]: value
    });
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !module.tags.includes(tagInput.trim())) {
      setModule({
        ...module,
        tags: [...module.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleTagRemove = (tag) => {
    setModule({
      ...module,
      tags: module.tags.filter(t => t !== tag)
    });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleLessonUpdate = (updatedLessons) => {
    setModule({
      ...module,
      lessons: updatedLessons
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      // Validate basic module info
      if (!module.title.trim() || !module.description.trim()) {
        toast.error('Title and description are required');
        return;
      }
      setCurrentStep(2);
      return;
    }

    // Submit the complete module
    try {
      setIsLoading(true);
      const response = await axios.post(
        '/api/learning-modules',
        module,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('Learning module created successfully!');
      navigate(`/teacher/modules/${response.data._id}`);
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error(error.response?.data?.message || 'Failed to create learning module');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-hr-dark-secondary rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold text-hr-blue mb-6">Create Learning Module</h1>
      
      {isLoading ? (
        <Loader />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 ? (
            // Step 1: Module Information
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={module.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-hr-dark border border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-hr-blue focus:border-hr-blue"
                      placeholder="Introduction to SQL"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={module.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-hr-dark border border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-hr-blue focus:border-hr-blue"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300">Difficulty</label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={module.difficulty}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-hr-dark border border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-hr-blue focus:border-hr-blue"
                    >
                      {difficulties.map((difficulty) => (
                        <option key={difficulty.value} value={difficulty.value}>
                          {difficulty.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">Image URL</label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={module.imageUrl}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-hr-dark border border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-hr-blue focus:border-hr-blue"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={module.description}
                      onChange={handleInputChange}
                      rows="5"
                      className="mt-1 block w-full rounded-md bg-hr-dark border border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-hr-blue focus:border-hr-blue"
                      placeholder="A comprehensive introduction to SQL basics..."
                      required
                    ></textarea>
                  </div>

                  {/* Tags */}
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-300">Tags</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        id="tagInput"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        className="flex-grow rounded-md bg-hr-dark border border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-hr-blue focus:border-hr-blue"
                        placeholder="Add a tag and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleTagAdd}
                        className="ml-2 px-3 py-2 bg-hr-blue text-white rounded-md hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {module.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-hr-dark-light px-2 py-1 rounded-md text-sm flex items-center"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag)}
                            className="ml-1 text-gray-400 hover:text-gray-200"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Published Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublished"
                      name="isPublished"
                      checked={module.isPublished}
                      onChange={(e) => setModule({...module, isPublished: e.target.checked})}
                      className="h-4 w-4 text-hr-blue focus:ring-hr-blue border-gray-600 rounded"
                    />
                    <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-300">
                      Publish immediately
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" variant="primary">
                  Next: Add Lessons
                </Button>
              </div>
            </>
          ) : (
            // Step 2: Lessons
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Module Lessons</h2>
                <p className="text-gray-400">Add and order lessons for your learning module</p>
              </div>
              
              <LessonEditor 
                lessons={module.lessons} 
                onLessonsUpdate={handleLessonUpdate} 
              />
              
              <div className="flex justify-between mt-6">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setCurrentStep(1)}
                >
                  Back to Module Info
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={module.lessons.length === 0}
                >
                  {module.isPublished ? 'Create & Publish Module' : 'Save Draft'}
                </Button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
};

export default CreateLearningModule; 