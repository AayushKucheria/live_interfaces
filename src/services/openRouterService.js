/**
 * Service for interacting with the OpenRouter API to access Claude Sonnet
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Sends a message to Claude Sonnet via OpenRouter API
 * @param {string} message - User message to send to Claude
 * @param {string} systemPrompt - Optional system prompt to guide Claude's response
 * @param {string} modelName - Name of the model to use (defaults to Claude Sonnet)
 * @param {AbortController} abortController - Optional AbortController to enable request cancellation
 * @returns {Promise<string>} - Response content from Claude
 */
export const sendMessageToClaude = async (
  message, 
  systemPrompt = '', 
  modelName = 'anthropic/claude-3-sonnet:20240229',
  abortController = null
) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured');
  }

  try {
    // Create messages array - add system message if provided
    const messages = [];
    
    if (systemPrompt && systemPrompt.trim() !== '') {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: message });
    
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'CatCoLab Loopy Visualizer'
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        max_tokens: 4000, // Increase max tokens for larger JSON responses
        temperature: 0.1, // Lower temperature for more deterministic JSON generation
      })
    };
    
    // If an abort controller was provided, add the signal
    if (abortController && abortController.signal) {
      fetchOptions.signal = abortController.signal;
    }
    
    const response = await fetch(OPENROUTER_API_URL, fetchOptions);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    // If the request was aborted, handle it gracefully
    if (error.name === 'AbortError') {
      console.log('Request was cancelled by the user');
      throw new Error('Request cancelled');
    }
    
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
}; 