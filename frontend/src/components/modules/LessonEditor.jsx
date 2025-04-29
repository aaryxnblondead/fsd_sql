import React, { useState } from 'react';
import { FaTrash, FaArrowUp, FaArrowDown, FaEdit, FaPlus } from 'react-icons/fa';
import Button from '../common/Button';
import CodeEditor from '../common/CodeEditor';
import { toast } from 'react-hot-toast';

const LessonEditor = ({ lessons = [], onLessonsUpdate }) => {
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    codeSnippet: '',
    quizQuestions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctOption: 0
  });

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle code snippet changes
  const handleCodeChange = (value) => {
    setFormData({
      ...formData,
      codeSnippet: value
    });
  };

  // Add new lesson
  const handleAddLesson = () => {
    setIsEditing(true);
    setCurrentLesson(null);
    setFormData({
      title: '',
      content: '',
      videoUrl: '',
      codeSnippet: '',
      quizQuestions: []
    });
  };

  // Edit existing lesson
  const handleEditLesson = (index) => {
    setIsEditing(true);
    setCurrentLesson(index);
    setFormData({ ...lessons[index] });
  };

  // Save lesson (add new or update existing)
  const handleSaveLesson = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    let updatedLessons = [...lessons];
    
    if (currentLesson === null) {
      // Add new lesson
      updatedLessons.push({ ...formData, orderIndex: lessons.length });
    } else {
      // Update existing lesson
      updatedLessons[currentLesson] = { ...formData, orderIndex: lessons[currentLesson].orderIndex };
    }
    
    onLessonsUpdate(updatedLessons);
    setIsEditing(false);
    toast.success(currentLesson === null ? 'Lesson added' : 'Lesson updated');
  };

  // Delete lesson
  const handleDeleteLesson = (index) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      const updatedLessons = lessons.filter((_, i) => i !== index);
      // Update order indices
      updatedLessons.forEach((lesson, i) => {
        lesson.orderIndex = i;
      });
      onLessonsUpdate(updatedLessons);
      toast.success('Lesson deleted');
    }
  };

  // Move lesson up in order
  const handleMoveUp = (index) => {
    if (index === 0) return;
    
    const updatedLessons = [...lessons];
    const temp = updatedLessons[index];
    updatedLessons[index] = updatedLessons[index - 1];
    updatedLessons[index - 1] = temp;
    
    // Update order indices
    updatedLessons.forEach((lesson, i) => {
      lesson.orderIndex = i;
    });
    
    onLessonsUpdate(updatedLessons);
  };

  // Move lesson down in order
  const handleMoveDown = (index) => {
    if (index === lessons.length - 1) return;
    
    const updatedLessons = [...lessons];
    const temp = updatedLessons[index];
    updatedLessons[index] = updatedLessons[index + 1];
    updatedLessons[index + 1] = temp;
    
    // Update order indices
    updatedLessons.forEach((lesson, i) => {
      lesson.orderIndex = i;
    });
    
    onLessonsUpdate(updatedLessons);
  };

  // Handle quiz question changes
  const handleQuestionChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      text: e.target.value
    });
  };

  // Handle quiz option changes
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...currentQuestion.options];
    updatedOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions
    });
  };

  // Handle correct option selection
  const handleCorrectOptionChange = (index) => {
    setCurrentQuestion({
      ...currentQuestion,
      correctOption: index
    });
  };

  // Add question to the quiz
  const handleAddQuestion = () => {
    if (!currentQuestion.text.trim() || currentQuestion.options.some(opt => !opt.trim())) {
      toast.error('Question text and all options are required');
      return;
    }
    
    setFormData({
      ...formData,
      quizQuestions: [
        ...formData.quizQuestions,
        { ...currentQuestion }
      ]
    });
    
    // Reset the question form
    setCurrentQuestion({
      text: '',
      options: ['', '', '', ''],
      correctOption: 0
    });
  };

  // Delete a question from the quiz
  const handleDeleteQuestion = (index) => {
    const updatedQuestions = formData.quizQuestions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      quizQuestions: updatedQuestions
    });
  };

  // Cancel editing and return to lesson list
  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="bg-hr-dark-secondary p-4 rounded-lg">
      {!isEditing ? (
        // Lesson List View
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Lessons ({lessons.length})</h3>
            <Button 
              variant="primary" 
              onClick={handleAddLesson} 
              className="flex items-center"
            >
              <FaPlus className="mr-2" /> Add Lesson
            </Button>
          </div>
          
          {lessons.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              No lessons added yet. Click "Add Lesson" to create the first lesson.
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center bg-hr-dark p-3 rounded-md"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{index + 1}. {lesson.title}</h4>
                    <div className="text-sm text-gray-400 mt-1">
                      {lesson.quizQuestions.length > 0 && (
                        <span className="mr-3">Quiz: {lesson.quizQuestions.length} questions</span>
                      )}
                      {lesson.videoUrl && <span className="mr-3">Video</span>}
                      {lesson.codeSnippet && <span>Code Snippet</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleMoveUp(index)} 
                      disabled={index === 0}
                      className={`p-1 rounded hover:bg-hr-dark-light ${index === 0 ? 'text-gray-600' : 'text-gray-400'}`}
                    >
                      <FaArrowUp />
                    </button>
                    <button 
                      onClick={() => handleMoveDown(index)} 
                      disabled={index === lessons.length - 1}
                      className={`p-1 rounded hover:bg-hr-dark-light ${index === lessons.length - 1 ? 'text-gray-600' : 'text-gray-400'}`}
                    >
                      <FaArrowDown />
                    </button>
                    <button 
                      onClick={() => handleEditLesson(index)} 
                      className="p-1 rounded text-gray-400 hover:bg-hr-dark-light hover:text-gray-200"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDeleteLesson(index)} 
                      className="p-1 rounded text-gray-400 hover:bg-hr-dark-light hover:text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Lesson Edit View
        <div>
          <h3 className="text-lg font-medium mb-4">
            {currentLesson === null ? 'Add New Lesson' : 'Edit Lesson'}
          </h3>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">Lesson Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-hr-dark border border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-hr-blue focus:border-hr-blue"
                placeholder="Introduction to SQL Joins"
                required
              />
            </div>
            
            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300">Lesson Content</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="6"
                className="mt-1 block w-full rounded-md bg-hr-dark border border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-hr-blue focus:border-hr-blue"
                placeholder="Enter lesson content in Markdown format..."
                required
              ></textarea>
            </div>
            
            {/* Video URL */}
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-300">Video URL (optional)</label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-hr-dark border border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-hr-blue focus:border-hr-blue"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            
            {/* Code Snippet */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Code Snippet (optional)</label>
              <CodeEditor
                value={formData.codeSnippet}
                onChange={handleCodeChange}
                language="sql"
                height="200px"
              />
            </div>
            
            {/* Quiz Questions */}
            <div className="mt-6">
              <h4 className="text-md font-medium mb-2">Quiz Questions</h4>
              
              {/* Question list */}
              {formData.quizQuestions.length > 0 && (
                <div className="mb-4 space-y-3">
                  {formData.quizQuestions.map((question, index) => (
                    <div key={index} className="bg-hr-dark p-3 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Q{index + 1}: {question.text}</p>
                          <ul className="ml-4 mt-1 list-disc">
                            {question.options.map((option, optIndex) => (
                              <li key={optIndex} className={optIndex === question.correctOption ? 'text-green-500' : ''}>
                                {option}
                                {optIndex === question.correctOption && ' (correct)'}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button 
                          onClick={() => handleDeleteQuestion(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add new question form */}
              <div className="bg-hr-dark-light p-3 rounded-md">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300">Question</label>
                  <input
                    type="text"
                    value={currentQuestion.text}
                    onChange={handleQuestionChange}
                    className="mt-1 block w-full rounded-md bg-hr-dark border border-gray-600 shadow-sm py-2 px-3 focus:outline-none focus:ring-hr-blue focus:border-hr-blue"
                    placeholder="What is a JOIN in SQL?"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300">Options</label>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center mt-2">
                      <input
                        type="radio"
                        id={`option-${index}`}
                        name="correctOption"
                        checked={currentQuestion.correctOption === index}
                        onChange={() => handleCorrectOptionChange(index)}
                        className="mr-2"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-grow rounded-md bg-hr-dark border border-gray-600 shadow-sm py-1 px-3 focus:outline-none focus:ring-hr-blue focus:border-hr-blue"
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="text-right">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddQuestion}
                  >
                    Add Question
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between mt-6">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="primary"
                onClick={handleSaveLesson}
              >
                Save Lesson
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonEditor; 