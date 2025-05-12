import { sendMessageToClaude } from './openRouterService';
import { simplifyModelForAI } from '../utils/modelFormatUtils';

/**
 * Generates thread suggestions for model modification based on the current model
 * @param {Object} model - The current model in simplified format
 * @returns {Promise<Object>} - Object containing thread suggestions from Claude
 */
export const generateThreadSuggestions = async (model) => {
  // Create a simplified representation of the model to send to the AI
  const simplifiedModel = simplifyModelForAI(model);
  
  // System prompt to guide Claude's response
  const systemPrompt = `
  You are an AI specialized in causal modeling. Analyze this model and generate specific, one-step improvement suggestions.

  OUTPUT FORMAT:
  {
    "threads": [
      {
        "id": "thread_id",
        "label": "Thread Label",
        "description": "Brief description",
        "suggestions": [
          {
            "id": "suggestion_id", 
            "title": "Suggestion Title",
            "description": "Detailed explanation (1-3 sentences)"
          }
        ]
      }
    ]
  }
  
  THREAD TYPES:
  1. Add new variables
  2. Increase relationship nuance
  3. Simplify while preserving dynamics
  
  QUALITY CRITERIA:
  - Specific and directly relevant to the existing model
  - Clearly explain interaction with existing variables
  - Describe potential new dynamics that would emerge
  - Domain-appropriate and realistic
  - Implementable in a single step
  - Generate EXACTLY 3 suggestions per thread type, no more and no less
  
  EXAMPLES (for a fox-rabbit predator-prey model):
  
  Adding Variables:
  - "Add Vegetation": Creates positive effect on rabbits, forming loop: vegetation → rabbits(+) → foxes(+) → rabbits(-) → vegetation(+)
  - "Add Disease": Negatively affects population, creating temporary disruptions and oscillations in the predator-prey balance
  
  Increasing Nuance:
  - "Add Time Delays": Create realistic population cycles by delaying effects between predator and prey populations
  - "Add Population Thresholds": Implement carrying capacity where predator efficiency decreases below certain prey density
  
  Identify the domain from existing variables and tailor suggestions appropriately. Return ONLY valid JSON.
  `;

  // User message that includes the simplified model
  const userMessage = `
  Please analyze this causal model and suggest threads for improvement:
  ${JSON.stringify(simplifiedModel, null, 2)}
  
  Generate thread suggestions that would help extend or refine this model in a one-step way, as described in your system message.
  `;

  try {
    // Send to Claude and get the response
    const response = await sendMessageToClaude(userMessage, systemPrompt);
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (in case Claude adds extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON pattern found, try parsing directly
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Error parsing Claude response as JSON:', parseError);
      // Return a default structure if parsing fails
      return {
        threads: [
          {
            id: 'add_variable',
            label: 'Add another variable',
            description: 'Introduce a new factor to the system',
            suggestions: [
              {
                id: 'generic_suggestion',
                title: 'Add a Related Factor',
                description: 'Consider what other variables might affect your model.'
              }
            ]
          }
        ]
      };
    }
  } catch (error) {
    console.error('Error getting thread suggestions from Claude:', error);
    throw error;
  }
}; 