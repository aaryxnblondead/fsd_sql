import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate AI feedback for a SQL query submission
 * @param {string} userCode - The user's SQL query
 * @param {Array|object} actualResults - The results from executing the user's query
 * @param {Array|object} expectedResults - The expected results for the challenge
 * @param {string} schemaDefinition - SQL schema definition for reference
 * @returns {string} AI-generated feedback
 */
export const generateAiFeedback = async (userCode, actualResults, expectedResults, schemaDefinition) => {
  try {
    // Ensure API key is available
    if (!process.env.OPENAI_API_KEY) {
      return 'AI feedback is currently unavailable. Please check your solution manually.';
    }
    
    // Prepare context for OpenAI
    const context = {
      userCode,
      actualResults: JSON.stringify(actualResults, null, 2),
      expectedResults: JSON.stringify(expectedResults, null, 2),
      schema: schemaDefinition
    };
    
    // Construct the prompt
    const prompt = `
You are an expert SQL tutor helping a student understand why their query didn't produce the expected results.

DATABASE SCHEMA:
\`\`\`sql
${context.schema}
\`\`\`

THE STUDENT'S SQL QUERY:
\`\`\`sql
${context.userCode}
\`\`\`

ACTUAL RESULTS FROM THEIR QUERY:
\`\`\`json
${context.actualResults}
\`\`\`

EXPECTED RESULTS:
\`\`\`json
${context.expectedResults}
\`\`\`

Please provide helpful feedback to the student about:
1. What's wrong with their query
2. Why it produced the results it did
3. What concepts they might be misunderstanding
4. A hint about how to fix it (without giving the full solution)

Keep your response under 300 words and focus on being educational rather than just pointing out errors.
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // Use the appropriate model
      messages: [
        { role: 'system', content: 'You are a helpful SQL tutor who provides clear, concise feedback on SQL queries. Your goal is to guide students to understand where their queries went wrong and how to fix them, without giving away complete solutions.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    // Return the generated feedback
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return 'Sorry, there was an error generating AI feedback. Please check your solution manually.';
  }
}; 