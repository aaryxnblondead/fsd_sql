import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generates feedback for SQL queries using OpenAI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateSQLFeedback = async (req, res) => {
  try {
    const { query, expectedOutput, actualOutput, error } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    // Construct the prompt for OpenAI
    const prompt = constructFeedbackPrompt(query, expectedOutput, actualOutput, error);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "You are an expert SQL tutor. Your task is to explain why a student's SQL query isn't working as expected and provide guidance on how to fix it."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    // Extract the feedback from OpenAI's response
    const feedback = response.choices[0].message.content.trim();

    return res.status(200).json({
      success: true,
      feedback
    });

  } catch (error) {
    console.error('Error generating SQL feedback:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to generate SQL feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Test endpoint for SQL feedback (no authentication required)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const testSQLFeedback = async (req, res) => {
  try {
    const { query, expectedOutput, actualOutput, error } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.warn('OpenAI API key not configured. Using mock response.');
      
      // Return a mock response if API key isn't configured
      return res.status(200).json({
        success: true,
        feedback: "This is a mock response. To get real AI-powered feedback, configure the OPENAI_API_KEY in your backend .env file. Based on the query provided, you might want to check your syntax, table names, and column references.",
        isMock: true
      });
    }

    // Construct the prompt for OpenAI
    const prompt = constructFeedbackPrompt(query, expectedOutput, actualOutput, error);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "You are an expert SQL tutor. Your task is to explain why a student's SQL query isn't working as expected and provide guidance on how to fix it."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    // Extract the feedback from OpenAI's response
    const feedback = response.choices[0].message.content.trim();

    return res.status(200).json({
      success: true,
      feedback
    });

  } catch (error) {
    console.error('Error generating SQL feedback:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to generate SQL feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Constructs a prompt for OpenAI based on the SQL query and results
 * @param {string} query - The SQL query
 * @param {string} expectedOutput - The expected output
 * @param {string} actualOutput - The actual output
 * @param {string} error - Any error message
 * @returns {string} The prompt for OpenAI
 */
const constructFeedbackPrompt = (query, expectedOutput, actualOutput, error) => {
  return `
I'm trying to write an SQL query, but I'm having trouble getting the correct results.

Here's my query:
\`\`\`sql
${query}
\`\`\`

This is the expected output:
\`\`\`
${expectedOutput}
\`\`\`

${actualOutput ? `This is the actual output I received:
\`\`\`
${actualOutput}
\`\`\`` : "My query didn't return any output."}

${error ? `I received this error message:
\`\`\`
${error}
\`\`\`` : ""}

Can you explain what I did wrong and how I can fix my query to get the expected output? Please be specific and provide examples, but keep your answer concise.
`;
}; 