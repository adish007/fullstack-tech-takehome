/**
 * openai.ts
 * This file contains utility functions for interacting with the OpenAI API.
 */

/**
 * Sends a request to the OpenAI API to clean data
 * @param data The data to be cleaned
 * @returns Cleaned data from OpenAI as a string
 */
export const cleanDataWithOpenAI = async (data: any): Promise<string | { error: string }> => {
  try {
    // Simplified environment variable access
    const apiKey = process.env.NEXT_PUBLIC_OPEN_AI_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Convert data to string if it's not already
    const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that cleans and formats data to make it more readable for humans.'
          },
          {
            role: 'user',
            content: `Clean the following data to make it easier for a human to read: ${dataString}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const result = await response.json();
    // Return only the cleaned text content from ChatGPT
    return result.choices[0].message.content;
  } catch (error: any) {
    console.error('Error cleaning data with OpenAI:', error);
    // Return an error object that can be detected in the workflow executor
    return {
      error: error.message || 'Error cleaning data with OpenAI'
    };
  }
};
