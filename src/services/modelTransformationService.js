import { sendMessageToClaude } from './openRouterService';
import { simplifyModelForAI, convertToLoopyFormat, extractJSONFromResponse } from '../utils/modelFormatUtils';

/**
 * Implements a suggestion on the provided model by sending it to Claude AI
 * @param {Object} model - The current model in Loopy format
 * @param {Object} suggestion - The suggestion object with title and description
 * @param {string} systemPrompt - The system prompt to use for Claude
 * @returns {Promise<Object>} - A promise that resolves to the modified model in Loopy format
 */
export const implementSuggestion = async (model, suggestion, systemPrompt) => {
  // If there's no model, we can't do anything
  if (!model || !model.nodes) {
    throw new Error('Cannot implement suggestion - no valid model available');
  }
  
  // Prepare the model in a simplified format for Claude
  const simplifiedModel = simplifyModelForAI(model);
  
  // Prepare user message with the model and the suggestion
  const userMessage = `
  Here is the current causal model:
  ${JSON.stringify(simplifiedModel, null, 2)}
  
  Implement this modification: "${suggestion.title}"
  Description: ${suggestion.description}
  
  Return the modified model.
  `;
  
  // Send to Claude
  const response = await sendMessageToClaude(userMessage, systemPrompt);
  
  try {
    // Extract and parse JSON from the response
    const modifiedModel = extractJSONFromResponse(response);
    
    // Convert to Loopy format for direct update
    return convertToLoopyFormat(modifiedModel);
  } catch (error) {
    throw new Error(`Error parsing modified model: ${error.message}`);
  }
};

/**
 * Merges two models based on user feedback using Claude AI
 * @param {Object} currentModel - The current model 
 * @param {Object} modelToMerge - The model to merge with the current model
 * @param {string} currentModelName - The name of the current model
 * @param {string} mergeModelTitle - The title of the model to merge
 * @param {string} feedback - User feedback on how to merge the models
 * @param {string} systemPrompt - The system prompt to use for Claude
 * @param {AbortController} abortController - Optional AbortController to cancel the request
 * @returns {Promise<Object>} - A promise that resolves to the merged model and generated response
 */
export const mergeModels = async (
  currentModel, 
  modelToMerge, 
  currentModelName, 
  mergeModelTitle, 
  feedback, 
  systemPrompt, 
  abortController = null
) => {
  // User message with the models and context
  const userMessage = `Here are two causal loop diagram models to merge. The first model is called "${currentModelName}" and the second is "${mergeModelTitle}". User feedback about the second model: "${feedback}".

Model 1: ${JSON.stringify(currentModel)}
Model 2: ${JSON.stringify(modelToMerge)}

Please merge these models and return ONLY the valid JSON of the merged model.`;
  
  // Call Claude through OpenRouter with the system prompt and abort controller
  const response = await sendMessageToClaude(
    userMessage, 
    systemPrompt, 
    'anthropic/claude-3-sonnet:20240229',
    abortController
  );
  
  try {
    // Extract and parse JSON from the response
    const mergedModel = extractJSONFromResponse(response);
    
    return {
      mergedModel,
      response
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Prepares for model merging by setting up the UI state
 * @param {Event} e - The event object
 * @param {Object} model - The model to merge
 * @param {string} title - The title of the model
 * @param {Function} setModelToMerge - State setter for the model to merge
 * @param {Function} setMergeModelTitle - State setter for the model title
 * @param {Function} setMergeModalOpen - State setter for the merge modal open state
 */
export const prepareModelMerge = (e, model, title, setModelToMerge, setMergeModelTitle, setMergeModalOpen) => {
  e.stopPropagation(); // Prevent triggering the parent onClick
  setModelToMerge(model);
  setMergeModelTitle(title);
  setMergeModalOpen(true);
}; 