import React, { useState, useMemo, memo, useEffect, useRef, useCallback } from 'react';
import LoopyVisualizer from './components/LoopyVisualizer';
import MermaidDiagram from './components/MermaidDiagram';
import { modelToMermaid, parseModelData } from './utils/mermaidUtils';
import { jsonModels, formatModelName, getModelNames, addModelToLibrary } from './utils/jsonModelLoader';
import { sendMessageToClaude } from './services/openRouterService';

// Modal component for displaying the larger Mermaid diagram
const MermaidModal = ({ isOpen, onClose, model, title }) => {
  if (!isOpen) return null;
  
  // Generate the mermaid code for the modal
  const mermaidCode = useMemo(() => {
    if (!model) return '';
    const parsedModel = parseModelData(model);
    return modelToMermaid(parsedModel, { direction: 'TB', nodeStyle: 'box' });
  }, [model]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 flex-1 overflow-auto">
          <MermaidDiagram chart={mermaidCode} />
        </div>
      </div>
    </div>
  );
};

// Modal for merging models with AI assistance
const MergeModal = ({ isOpen, onClose, model, title, onSubmit, isLoading, onCancel }) => {
  const [feedback, setFeedback] = useState('');
  // Animation steps for loading
  const loadingSteps = [
    "Analyzing model structures...",
    "Identifying overlapping concepts...",
    "Applying category theory concepts...",
    "Creating functorial pushout...",
    "Merging model metadata...",
    "Finalizing integration..."
  ];
  // Current step index
  const [stepIndex, setStepIndex] = useState(0);
  
  // Update step every few seconds
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setStepIndex((prev) => (prev + 1) % loadingSteps.length);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setStepIndex(0);
    }
  }, [isLoading, loadingSteps.length]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Merge Models</h3>
          <button 
            onClick={isLoading ? onCancel : onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className="absolute top-0 left-0 h-16 w-16 flex items-center justify-center">
                  <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full"></div>
                </div>
              </div>
              
              <div className="max-w-xs w-full mb-4">
                <div className="text-center mb-2">
                  <span className="text-purple-700 font-semibold">{loadingSteps[stepIndex]}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2.5 w-full">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(stepIndex + 1) * (100 / loadingSteps.length)}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-gray-600 text-center font-medium">Merging with Claude AI</p>
              <p className="text-gray-500 text-sm text-center mt-1 mb-4">Using category theory principles to create an optimal integration</p>
              
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <p className="mb-4">What aspects of <span className="font-medium">{title}</span> would you like to combine with your current model?</p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Describe what elements you want to merge and how they should be combined..."
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    onSubmit(feedback);
                    setFeedback('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Merge Models
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Memoized MermaidPreview component to avoid unnecessary re-renders
const MermaidPreview = memo(({ model, isSelected }) => {
  // Memoize the mermaid code generation
  const mermaidCode = useMemo(() => {
    const parsedModel = parseModelData(model);
    return modelToMermaid(parsedModel, { direction: 'TB', nodeStyle: 'box' });
  }, [model]);
  
  return (
    <div className="p-2 bg-gray-50 rounded-b-md">
      <div className="mermaid-preview" style={{ maxHeight: '150px', overflow: 'hidden' }}>
        <MermaidDiagram 
          chart={mermaidCode} 
          config={{ 
            theme: 'neutral',
            fontFamily: 'system-ui, sans-serif',
            flowchart: { curve: 'basis', htmlLabels: true }
          }} 
          compact={true}
        />
      </div>
      <div className="mt-2 w-full text-xs text-gray-500 text-center italic">
        Click to expand
      </div>
    </div>
  );
});

// Model Library Overlay component that displays model cards in a grid layout
const ModelLibraryOverlay = ({ isOpen, onClose, models, onSelectModel }) => {
  const [selectedModels, setSelectedModels] = useState([]);
  const [showingComparison, setShowingComparison] = useState(false);
  
  if (!isOpen) return null;
  
  // Format model name by removing .json extension and adding spaces
  const formatModelName = (filename) => {
    return filename
      .replace('.json', '')
      .split(/(?=[A-Z])|[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const toggleModelSelection = (filename) => {
    if (selectedModels.includes(filename)) {
      // Remove model from selection
      setSelectedModels(selectedModels.filter(name => name !== filename));
    } else if (selectedModels.length < 3) {
      // Add model to selection only if less than 3 models are currently selected
      setSelectedModels([...selectedModels, filename]);
    }
    // If already 3 models selected, do nothing
  };
  
  // Generate simplified mermaid code for each model
  const generateSimplifiedMermaid = (model) => {
    const parsedModel = parseModelData(model);
    // Use standard mermaid conversion with minimal styling options
    return modelToMermaid(parsedModel);
  };
  
  // Handle compare button click
  const handleCompareClick = () => {
    if (selectedModels.length > 0) {
      setShowingComparison(true);
    }
  };
  
  // Reset comparison view
  const resetComparison = () => {
    setShowingComparison(false);
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col overflow-auto">
      {/* Main content container with styling matching visualizer */}
      <div className="flex flex-col m-4 bg-white rounded-lg shadow-md h-full">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="w-1/3">
            {/* Left side - Visualizer button */}
            <div 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span>📊 Visualizer</span>
            </div>
          </div>
          
          {/* Center - Title */}
          <h2 className="text-2xl font-bold text-gray-800 text-center w-1/3">Model Directory</h2>
          
          {/* Right side - Close button */}
          <div className="w-1/3 flex justify-end">
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Main layout with three columns */}
        <div className="flex flex-1 overflow-hidden p-4">
          {/* Left column */}
          <div className="w-1/4 flex flex-col space-y-4 mr-4">
            {/* Future prompting area */}
            <div className="border border-gray-200 rounded-lg p-4 flex-1 bg-gray-50">
              <p className="text-gray-600 italic">
                &lt;Future prompting area for searching, including by structure, subgraph size and shape, reinforcing and balancing loops, application domain etc&gt;
              </p>
            </div>
            
            {/* Placeholder info area */}
            <div className="border border-gray-200 rounded-lg p-4 flex-1 bg-gray-50">
              <p className="text-gray-600 italic">
                &lt;Placeholder space for more information about the model's inspiration, central mechanism/functional difference from other options.&gt;
              </p>
            </div>
          </div>
          
          {/* Center and right column for model display */}
          <div className="w-3/4 flex flex-col overflow-hidden">
            {/* Fixed controls section */}
            <div className="sticky top-0 bg-white z-10 pb-4">
              {/* Compare Selection button */}
              <div className="flex justify-center mb-6">
                <div 
                  className={`px-6 py-2 bg-orange-500 text-white rounded-md ${selectedModels.length > 0 ? 'cursor-pointer hover:bg-orange-600' : 'opacity-70 cursor-not-allowed'}`}
                  onClick={handleCompareClick}
                >
                  Compare Selection ({selectedModels.length}/3)
                </div>
              </div>
              
              {/* Experimental area */}
              <div className="mb-6">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {showingComparison ? (
                    <div>
                      <div className="flex justify-between mb-2">
                        <h3 className="text-gray-800 font-bold">COMPARING MODELS</h3>
                        <button 
                          onClick={resetComparison}
                          className="text-gray-600 hover:text-gray-800 focus:outline-none"
                        >
                          Reset
                        </button>
                      </div>
                      <div className="flex justify-center space-x-4">
                        {selectedModels.map((filename) => (
                          <div key={filename} className="w-1/3 border border-gray-300 rounded-lg p-2 bg-white">
                            <div className="h-32 flex items-center justify-center">
                              <MermaidDiagram 
                                chart={generateSimplifiedMermaid(models[filename])} 
                                config={{ 
                                  theme: 'neutral',
                                  fontFamily: 'system-ui, sans-serif',
                                  flowchart: { curve: 'basis', htmlLabels: true },
                                }} 
                                compact={true}
                              />
                            </div>
                            <div className="text-gray-700 text-sm font-medium text-center mt-2">
                              {formatModelName(filename)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="italic text-center text-gray-600">&lt;EXPERIMENTAL AREA FOR POSSIBLE COMPOSITIONS&gt;</p>
                  )}
                </div>
                
                <div className="mt-4 flex justify-center">
                  <div className={`inline-block px-6 py-2 bg-green-600 text-white rounded-md ${showingComparison ? 'cursor-pointer hover:bg-green-700' : 'opacity-70'}`}>
                    Confirm Compose
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scrollable model grid */}
            <div className="overflow-y-auto h-full">
              {/* Model Grid - all models in 3 columns */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                {Object.keys(models).map((filename, index) => {
                  const model = models[filename];
                  const displayName = formatModelName(filename);
                  const isSelected = selectedModels.includes(filename);
                  const mermaidCode = generateSimplifiedMermaid(model);
                  
                  return (
                    <div 
                      key={filename}
                      className={`border ${isSelected ? 'border-orange-500 ring-2 ring-orange-500' : 'border-gray-200'} rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md`}
                      onClick={() => onSelectModel(model, displayName)}
                    >
                      <div className="p-4 flex flex-col items-center">
                        {/* Model Graph Visualization */}
                        <div className="mb-4 h-32 w-full flex items-center justify-center">
                          <MermaidDiagram 
                            chart={mermaidCode} 
                            config={{ 
                              theme: 'neutral',
                              fontFamily: 'system-ui, sans-serif',
                              flowchart: { curve: 'basis', htmlLabels: true },
                            }} 
                            compact={true}
                          />
                        </div>
                        
                        <div className="text-gray-800 text-sm font-medium mb-2 text-center">
                          {displayName}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                          <button 
                            className={`w-10 h-10 ${isSelected ? 'bg-orange-600' : 'bg-blue-700'} border border-blue-500 rounded-md text-white flex items-center justify-center hover:bg-blue-600 focus:outline-none ${selectedModels.length >= 3 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModelSelection(filename);
                            }}
                          >
                            {isSelected ? (
                              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            )}
                          </button>
                          <button 
                            className="w-10 h-10 bg-transparent border border-blue-500 rounded-md text-blue-400 flex items-center justify-center hover:bg-blue-900 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Response modal component for displaying Claude's response
const ResponseModal = ({ isOpen, onClose, response, isLoading }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-600 to-blue-600">
          <h3 className="text-xl font-semibold text-white">Model Integration Complete</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                <p className="mt-4 text-gray-600">Merging models with Claude AI...</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="mb-4 p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                <p className="text-purple-800 font-medium">AI-Assisted Model Integration</p>
                <p className="text-sm text-gray-600">Claude Sonnet used category theory principles to create a functorial pushout of the models.</p>
              </div>
              <p className="text-gray-700">{response}</p>
              <div className="mt-4 bg-blue-50 p-3 rounded text-sm text-blue-800">
                <p>The merged model is now loaded in your workspace. You can interact with it directly, save it for future use, or continue to refine it.</p>
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UnifiedInterface = () => {
  const [selectedModel, setSelectedModel] = useState('wolfchickens.json');
  const [modelNames, setModelNames] = useState([]);
  const [showAdvancedMermaid, setShowAdvancedMermaid] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [modelToMerge, setModelToMerge] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalModel, setModalModel] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  
  // Add state for model library overlay
  const [libraryOpen, setLibraryOpen] = useState(false);
  
  // Add state for merge modal
  const [mergeModelTitle, setMergeModelTitle] = useState('');
  
  // Add state for loading response
  const [loadingResponse, setLoadingResponse] = useState(false);
  
  // Add state for Claude's response
  const [claudeResponse, setClaudeResponse] = useState('');
  
  // Add state for showing response modal
  const [showResponseModal, setShowResponseModal] = useState(false);
  
  // Add ref for abort controller
  const abortControllerRef = useRef(null);
  
  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  useEffect(() => {
    // Load model names using the utility function
    setModelNames(getModelNames());
    // Set default selected model if needed
    if (!selectedModel && modelNames.length > 0) {
      setSelectedModel(modelNames[0]);
    }
  }, []);
  
  // Handler to open modal with a specific model
  const handleExpandModel = (model, title) => {
    setModalModel(model);
    setModalTitle(title || formatModelName(selectedModel));
    setModalOpen(true);
  };
  
  // Handler to open merge modal for merging a model
  const handleMergeModel = (e, model, title) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setModelToMerge(model);
    setMergeModelTitle(title);
    setMergeModalOpen(true);
  };
  
  // Handler for canceling the merge operation
  const handleCancelMerge = () => {
    // Abort any in-progress API calls
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Reset loading state and close modal
    setLoadingResponse(false);
    setMergeModalOpen(false);
  };
  
  // Handler for submitting feedback and merging the model
  const handleMergeSubmit = async (feedback) => {
    console.log('User feedback:', feedback);
    
    // Show loading state
    setLoadingResponse(true);
    
    // Create a new AbortController
    abortControllerRef.current = new AbortController();
    
    try {
      // Get the current selected model
      const currentModelName = selectedModel;
      const currentModel = jsonModels[currentModelName];
      const modelToMergeName = getModelNames().find(key => jsonModels[key] === modelToMerge);
      
      // Create system prompt for model merging
      const systemPrompt = `You will act as an AI specialized in merging multiple JSON representations of causal loop diagrams (CLDs) while preserving their underlying mathematical and structural integrity. I will provide you with an array of JSON models. Each model represents a causal loop diagram that includes formal declarations (objects and morphisms) as well as metadata and rich-text cells. Your task is to merge all these models into a single cohesive model.

Please adhere to the following guidelines:

Structural Preservation: Retain all crucial structural information and metadata from each input model. Ensure that every cell (whether rich-text, formal, or stem) is preserved.
Conflict Resolution: When overlapping or similar objects are found, merge them using a weighted approach that respects all sources.
Applied Category Theory: Employ concepts from applied category theory—specifically functors and pushouts—to guide the merging process.
Language Consistency: Preserve the original language, naming conventions, and metadata from all parent models.
Output Format: Output ONLY the final merged model as valid JSON with no additional explanations or text.`;
      
      // User message with the models and context
      const userMessage = `Here are two causal loop diagram models to merge. The first model is called "${formatModelName(currentModelName)}" and the second is "${mergeModelTitle}". User feedback about the second model: "${feedback}".

Model 1: ${JSON.stringify(currentModel)}
Model 2: ${JSON.stringify(modelToMerge)}

Please merge these models and return ONLY the valid JSON of the merged model.`;
      
      // Call Claude through OpenRouter with the system prompt and abort controller
      const claudeResponse = await sendMessageToClaude(
        userMessage, 
        systemPrompt, 
        'anthropic/claude-3-sonnet:20240229',
        abortControllerRef.current
      );
      
      try {
        // Try to parse the response as JSON
        let mergedModel;
        
        // Extract JSON from response if it contains text
        const jsonMatch = claudeResponse.match(/```(?:json)?([\s\S]*?)```/) || 
                          claudeResponse.match(/({[\s\S]*})/) ||
                          [null, claudeResponse];
        
        const jsonString = jsonMatch[1].trim();
        mergedModel = JSON.parse(jsonString);
        
        console.log('Successfully parsed merged model:', mergedModel);
        
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
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        
        // If we can't parse the JSON, just show the text response
        setClaudeResponse(`Claude provided a response but it couldn't be parsed as a valid model. Here's what Claude said: ${claudeResponse}`);
        
        // Close merge modal and show response modal
        setMergeModalOpen(false);
        setShowResponseModal(true);
        
        // Just use the model that was selected to be merged
        setSelectedModel(modelToMergeName);
      }
    } catch (error) {
      console.error('Error getting response from Claude:', error);
      
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
  
  // Get placeholder description for model
  const getModelDescription = (filename) => {
    // Placeholder descriptions that could be replaced with actual descriptions later
    const descriptions = {
      'wolfchickens.json': 'A simple predator-prey relationship model between wolves and chickens.',
      'wolfchickenworm.json': 'An ecosystem model with wolves, chickens, and worms interactions.',
      'wormedwolves.json': 'A parasitic relationship model between worms and wolves.',
      'causal-loop-json.json': 'A general causal loop diagram model example.',
      'team_dynamics.json': 'A model exploring relationships in team environments.',
      'conflict_resolution.json': 'A model showing the process of resolving conflicts.',
      'mediation_dynamics.json': 'A model of mediation processes in conflict resolution.',
      'communication_pathways.json': 'A model showing communication flows between entities.',
      'tension_escalation.json': 'A model demonstrating how conflicts escalate over time.',
      'peace_building.json': 'A model of processes that contribute to sustainable peace.',
      'trust_building.json': 'A model showing factors that build trust in relationships.',
      'emotional_intelligence.json': 'A model exploring components of emotional intelligence.',
      'social_support.json': 'A model of social support networks and their effects.',
      'communication_quality.json': 'A model of factors affecting communication quality.',
      'boundary_dynamics.json': 'A model showing boundary-setting in relationships.',
      'workplace_collaboration.json': 'A model of collaboration dynamics in workplace settings.',
      'interpersonal_boundaries.json': 'A model showing how personal boundaries affect relationships.',
      'relationship_communication.json': 'A model of communication patterns in close relationships.',
      'empathic_connection.json': 'A model of empathy and its effects on social connections.',
      'group_identity_formation.json': 'A model of how group identities form and their effects.'
    };
    
    return descriptions[filename] || 'A causal loop diagram model.';
  };
  
  // Sidebar component for model selection with Mermaid visualizations
  const ModelSidebar = () => {
    // Add searchTerm state here
    const [searchTerm, setSearchTerm] = useState('');
    // Add ref to maintain focus
    const searchInputRef = useRef(null);
    
    // Memoize filtered models calculation
    const filteredModels = useMemo(() => {
      return getModelNames().filter(filename => {
        const displayName = formatModelName(filename).toLowerCase();
        const description = getModelDescription(filename).toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return displayName.includes(search) || description.includes(search);
      });
    }, [searchTerm]); // Only recalculate when searchTerm changes
    
    // Add effect to maintain focus after render
    useEffect(() => {
      // If we have a ref to the search input and it should have focus
      if (searchInputRef.current && document.activeElement === searchInputRef.current) {
        // Keep the focus and cursor position
        const cursorPosition = searchInputRef.current.selectionStart;
        searchInputRef.current.focus();
        searchInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    });
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col overflow-hidden">
        {/* Replace the title with a button that opens the library overlay */}
        <button 
          onClick={() => setLibraryOpen(true)}
          className="text-lg font-semibold mb-4 text-gray-700 hover:text-blue-600 focus:outline-none text-left"
        >
          Available Models
        </button>
        
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          {filteredModels.length > 0 ? (
            filteredModels.map((filename) => {
              const model = jsonModels[filename];
              const isSelected = selectedModel === filename;
              const displayName = formatModelName(filename);
              const description = getModelDescription(filename);
              
              return (
                <div 
                  key={filename}
                  onClick={() => {
                    handleExpandModel(model, displayName);
                  }}
                  className={`rounded-md cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-blue-500' 
                      : 'hover:bg-blue-50'
                  } mb-4`}
                >
                  <div className="p-3 border-b border-gray-200">
                    <p className="font-medium text-gray-900">{displayName}</p>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                    <button
                      onClick={(e) => handleMergeModel(e, model, displayName)}
                      className="mt-2 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Merge With Current
                    </button>
                  </div>
                  <MermaidPreview 
                    model={model} 
                    isSelected={isSelected}
                  />
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No models found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-3">
        <h1 className="text-2xl font-bold text-gray-800">CatCoLab Loopy Visualizer</h1>
      </header>
      
      {/* Main content with sidebar layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main visualization area with Loopy */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <LoopyVisualizer 
              model={selectedModel ? jsonModels[selectedModel] : null} 
              title="Loopy Interactive Model" 
            />
          </div>
        </main>
        
        {/* Right sidebar with model selection and Mermaid previews */}
        <aside className="w-96 border-l border-gray-200 p-4 overflow-y-auto">
          <ModelSidebar />
        </aside>
      </div>
      
      {/* Footer with info */}
      <footer className="bg-white shadow-inner px-6 py-3 text-sm text-gray-600">
        <p>
          Loopy is an interactive tool for creating causal loop diagrams. 
          You can create nodes and arrows to model system dynamics.
        </p>
      </footer>
      
      {/* Modal for expanded Mermaid view */}
      <MermaidModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        model={modalModel}
        title={modalTitle}
      />
      
      {/* Merge modal for merging models */}
      <MergeModal
        isOpen={mergeModalOpen}
        onClose={() => setMergeModalOpen(false)}
        model={modelToMerge}
        title={mergeModelTitle}
        onSubmit={handleMergeSubmit}
        isLoading={loadingResponse}
        onCancel={handleCancelMerge}
      />
      
      {/* Response modal for Claude's response */}
      <ResponseModal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        response={claudeResponse}
        isLoading={loadingResponse}
      />
      
      {/* Model library overlay component */}
      <ModelLibraryOverlay
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        models={getModelNames().map(name => ({
          id: name,
          name: formatModelName(name),
          model: jsonModels[name]
        }))}
        onSelectModel={(id) => {
          setSelectedModel(id);
          setLibraryOpen(false);
        }}
      />
    </div>
  );
};

export default UnifiedInterface; 