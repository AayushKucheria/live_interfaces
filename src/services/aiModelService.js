import { implementSuggestion, mergeModels } from './modelTransformationService';
import { threadCompositionSystemPrompt, structuralCompositionSystemPrompt } from '../utils/prompts';
import { formatModelName, getModelNames, addModelToLibrary, jsonModels } from '../utils/jsonModelLoader';

/**
 * Implements a detailed suggestion and updates the model visualization
 * @param {Object} model - The current model in Loopy format
 * @param {Object} suggestion - The suggestion object with title and description
 * @param {Object} visualizerRef - Reference to the Loopy visualizer
 * @param {Function} onSuccess - Callback function to call on successful implementation
 * @param {Function} setIsLoading - Function to update loading state
 */
export const implementDetailedSuggestion = async (
  model, 
  suggestion, 
  visualizerRef, 
  onSuccess, 
  setIsLoading
) => {
  // Log the selected suggestion
  console.log(`Implementing suggestion: ${suggestion.title}`);
  
  // Show loading state
  setIsLoading(true);
  
  try {
    // Call the implementation service
    const loopyFormat = await implementSuggestion(model, suggestion, threadCompositionSystemPrompt);
    
    // Update the model via the global reference
    if (visualizerRef && visualizerRef.current) {
      visualizerRef.current.updateModel(loopyFormat);
      console.log('Updated Loopy model via global ref');
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } else {
      console.error('Could not find visualizer reference');
    }
  } catch (error) {
    console.error('Error implementing suggestion:', error);
  } finally {
    // Reset loading state
    setIsLoading(false);
  }
};

/**
 * Handles the complete model merging workflow
 * @param {string} feedback - User feedback on how to merge the models
 * @param {string} selectedModel - The name of the currently selected model
 * @param {Object} modelToMerge - The model to merge with the current model
 * @param {string} mergeModelTitle - The title of the model to merge
 * @param {Object} abortControllerRef - Reference to an AbortController
 * @param {Function} setLoadingResponse - Function to update loading state
 * @param {Function} setClaudeResponse - Function to update Claude's response
 * @param {Function} setSelectedModel - Function to update the selected model
 * @param {Function} setMergeModalOpen - Function to control the merge modal visibility
 * @param {Function} setShowResponseModal - Function to control the response modal visibility
 */
export const handleModelMergeWorkflow = async (
  feedback,
  selectedModel,
  modelToMerge,
  mergeModelTitle,
  abortControllerRef,
  setLoadingResponse,
  setClaudeResponse,
  setSelectedModel,
  setMergeModalOpen,
  setShowResponseModal
) => {
  // Show loading state
  setLoadingResponse(true);
  
  // Create a new AbortController if not provided
  if (!abortControllerRef.current) {
    abortControllerRef.current = new AbortController();
  }
  
  try {
    // Get the current selected model
    const currentModelName = selectedModel;
    const currentModel = jsonModels[currentModelName];
    
    // Call the mergeModels service
    const { mergedModel, response } = await mergeModels(
      currentModel,
      modelToMerge,
      formatModelName(currentModelName),
      mergeModelTitle,
      feedback,
      structuralCompositionSystemPrompt,
      abortControllerRef.current
    );
    
    // Create a new merged model name
    const baseModelName = `merged_${formatModelName(currentModelName).replace(/\s+/g, '_')}_${mergeModelTitle.replace(/\s+/g, '_')}`;
    
    // Add the merged model to jsonModels using the utility function
    const newModelName = addModelToLibrary(mergedModel, baseModelName);
    
    // Set response message
    setClaudeResponse(`Created a merged model combining "${formatModelName(currentModelName)}" and "${mergeModelTitle}". This new model incorporates elements from both source models based on your feedback.`);
    
    // Update the selected model to the new merged one
    setSelectedModel(newModelName);
    
    // Close merge modal and show response modal
    setMergeModalOpen(false);
    setShowResponseModal(true);
  } catch (error) {
    // Don't show error if the request was cancelled
    if (error.message !== 'Request cancelled') {
      setClaudeResponse('Sorry, there was an error getting a response from Claude.');
      
      // Close merge modal and show response modal
      setMergeModalOpen(false);
      setShowResponseModal(true);
      
      // Fallback to just using the model that was selected to be merged
      const modelToMergeName = getModelNames().find(key => jsonModels[key] === modelToMerge);
      setSelectedModel(modelToMergeName);
    } else {
      // Just close the modal without showing an error
      setMergeModalOpen(false);
    }
  } finally {
    // Reset loading state and clear abort controller reference
    setLoadingResponse(false);
    abortControllerRef.current = null;
  }
}; 