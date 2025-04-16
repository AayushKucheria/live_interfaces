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
  // Build mermaid code from model
  const mermaidCode = useMemo(() => {
    // Parse the model and generate simplified mermaid
    const parsedModel = parseModelData(model);
    return modelToMermaid(parsedModel);
  }, [model]);
  
  return (
    <div className="h-32 flex items-center justify-center p-1">
      <div 
        className={`w-full h-full flex items-center justify-center transition-opacity duration-200 ${!isSelected ? 'opacity-70' : 'opacity-100'}`}
      >
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
      <div className="mt-2 w-full text-xs text-gray-500 text-center italic">
        Click to expand
      </div>
    </div>
  );
});

// Modification threads component with list of options
const ModificationThreads = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Simplified options - just keeping 3 main ones
  const options = [
    { id: 'M1', label: 'M1', description: 'Balance' },
    { id: 'M2', label: 'M2', description: 'Reinforce' },
    { id: 'M3', label: 'M3', description: 'Enhance' }
  ];
  
  const handleOptionClick = (option) => {
    setSelectedOption(option.id === selectedOption ? null : option.id);
    console.log(`Selected option: ${option.label} - ${option.description}`);
  };
  
  return (
    <div className="h-full flex flex-col p-4 gap-2 overflow-auto">
      {options.map((option) => {
        const isSelected = option.id === selectedOption;
        
        return (
          <div 
            key={option.id}
            className={`flex flex-col p-4 rounded-lg shadow-sm cursor-pointer transition-all duration-200
              ${isSelected 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-blue-700 border border-gray-100 hover:bg-blue-50'
              }`}
            onClick={() => handleOptionClick(option)}
          >
            <div className={`flex items-center justify-center h-12 w-12 rounded-full mb-4
              ${isSelected ? 'bg-white bg-opacity-20' : 'bg-blue-50'}`
            }>
              <span className={`font-medium text-xl ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                {option.label}
              </span>
            </div>
            <span className="font-medium">{option.description}</span>
          </div>
        );
      })}
      
      {/* Title at the bottom */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Modification Threads</span>
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
  
  // Add a new state for the view mode 
  const [viewMode, setViewMode] = useState('focus'); // Options: 'focus', 'integrate', 'explore'
  
  // Layout configuration constants for each view mode
  const VIEW_MODE_LAYOUTS = {
    focus: {
      sidebarWidth: 0, // No models visible
      showModificationThreads: true,
      showLoopy: true
    },
    integrate: {
      sidebarWidth: 20, // One model column
      showModificationThreads: true,
      showLoopy: true
    },
    explore: {
      sidebarWidth: 65, // Full library view
      showModificationThreads: false,
      showLoopy: false
    }
  };
  
  // Handle view mode changes
  const handleViewModeChange = (mode) => {
    console.log(`View mode changed to: ${mode}`);
    setViewMode(mode);
  };
  
  // Get current layout configuration
  const layoutConfig = VIEW_MODE_LAYOUTS[viewMode];
  
  // Determine visibility of components based on layout config
  const isModificationThreadsVisible = layoutConfig.showModificationThreads;
  const isLoopyVisible = layoutConfig.showLoopy;
  
  // Dynamically determine grid columns based on width
  const getGridColumns = () => {
    const { sidebarWidth } = layoutConfig;
    if (sidebarWidth < 10) return 0; // No models visible in focus view
    if (sidebarWidth < 25) return 1; // One model column in integrate view
    if (sidebarWidth < 40) return 2;
    if (sidebarWidth < 60) return 3;
    return 4;
  };
  
  // Get CSS grid template columns for proper sizing
  const getGridStyle = () => {
    const cols = getGridColumns();
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap: '1rem',
    };
  };
  
  // Get the appropriate grid class based on column count
  const getGridClass = () => {
    return 'auto-rows-max';
  };
  
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
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter models based on search term
    const filteredModels = getModelNames().filter(name => 
      formatModelName(name).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Determine if sidebar content should be shown based on view mode
    const showSidebarContent = getGridColumns() > 0;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col overflow-hidden">
        {/* Header with title and expand/collapse indicator */}
        <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Available Models
        </h2>
          
          
        </div>
        
        {/* Search Bar - only show if models are visible */}
        {showSidebarContent && (
          <div className="mb-4">
            <div className="relative">
              <input
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
        )}
        
        <div className="flex-1 overflow-y-auto pr-2">
          {!showSidebarContent ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Models are hidden in focus view</p>
              <button 
                onClick={() => handleViewModeChange('integrate')}
                className="mt-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Switch to Integrate View
              </button>
            </div>
          ) : filteredModels.length > 0 ? (
            <div className={`${getGridClass()}`} style={getGridStyle()}>
              {filteredModels.map((filename) => {
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
                    } h-full flex flex-col`}
                >
                  <div className="p-3 border-b border-gray-200">
                      <p className="font-medium text-gray-900 truncate">{displayName}</p>
                      {getGridColumns() === 1 && (
                        <>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                    <button
                      onClick={(e) => handleMergeModel(e, model, displayName)}
                      className="mt-2 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Merge With Current
                    </button>
                        </>
                      )}
                  </div>
                    <div className="flex-1 min-h-0">
                  <MermaidPreview 
                    model={model} 
                    isSelected={isSelected}
                  />
                    </div>
                </div>
              );
              })}
            </div>
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
      <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Causal Modelling of Systems</h1>
          <p className="text-sm text-gray-500">Visualize and analyze complex system dynamics</p>
        </div>
        
        {/* View mode selector */}
        <div className="w-1/4 flex flex-col items-center">
          <div className="flex justify-between w-full mb-1">
            <span className={`text-xs font-medium transition-colors duration-200 ${viewMode === 'focus' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>Focus</span>
            <span className={`text-xs font-medium transition-colors duration-200 ${viewMode === 'integrate' ? 'text-purple-600 font-semibold' : 'text-gray-500'}`}>Integrate</span>
            <span className={`text-xs font-medium transition-colors duration-200 ${viewMode === 'explore' ? 'text-pink-600 font-semibold' : 'text-gray-500'}`}>Explore</span>
          </div>
          <div className="relative w-full h-8">
            {/* Background track */}
            <div 
              className="absolute left-0 right-0 top-1/2 h-1 -mt-0.5 rounded-full"
              style={{
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)'
              }}
            ></div>
            
            {/* Slider track indicator - snaps to one of three positions */}
            <div 
              className="absolute left-0 top-1/2 h-3 -mt-1.5 bg-white rounded-full shadow border border-gray-200 transition-all duration-300"
              style={{
                left: viewMode === 'focus' ? '0%' : viewMode === 'integrate' ? '50%' : '100%',
                transform: 'translateX(-50%)',
                width: '12px'
              }}
            ></div>
            
            {/* Mode selection buttons */}
            <div className="flex justify-between w-full absolute top-1/2 -mt-3 z-0">
              <button 
                className={`w-6 h-6 rounded-full shadow transition-all duration-300 flex items-center justify-center 
                  ${viewMode === 'focus' ? 'bg-blue-500 ring-4 ring-blue-200 scale-110' : 'bg-white border border-gray-300'}`}
                onClick={() => handleViewModeChange('focus')}
              >
                {viewMode === 'focus' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </button>
              <button 
                className={`w-6 h-6 rounded-full shadow transition-all duration-300 flex items-center justify-center 
                  ${viewMode === 'integrate' ? 'bg-purple-500 ring-4 ring-purple-200 scale-110' : 'bg-white border border-gray-300'}`}
                onClick={() => handleViewModeChange('integrate')}
              >
                {viewMode === 'integrate' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </button>
              <button 
                className={`w-6 h-6 rounded-full shadow transition-all duration-300 flex items-center justify-center 
                  ${viewMode === 'explore' ? 'bg-pink-500 ring-4 ring-pink-200 scale-110' : 'bg-white border border-gray-300'}`}
                onClick={() => handleViewModeChange('explore')}
              >
                {viewMode === 'explore' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content with sidebar layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar with modification threads (visible in focus and integrate views) */}
        {isModificationThreadsVisible && (
          <aside className="w-72 transition-all duration-300 ease-in-out">
            <ModificationThreads />
          </aside>
        )}
        
        {/* Main visualization area with Loopy or placeholder */}
        <main 
          className="transition-all duration-300 ease-in-out overflow-auto p-6 flex-1"
          style={{ width: isModificationThreadsVisible ? `calc(100% - ${layoutConfig.sidebarWidth}% - 18rem)` : `calc(100% - ${layoutConfig.sidebarWidth}%)` }}
        >
          <div className="bg-white rounded-lg shadow-md p-6 h-full relative">
            {isLoopyVisible ? (
              <>
                <LoopyVisualizer 
                  model={selectedModel ? jsonModels[selectedModel] : null} 
                  title="Workspace" 
                />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Experimental Viewbox</h3>
                <p className="text-gray-500 max-w-xs">
                  The library explore mode provides a comprehensive view of available models.
                </p>
                <div className="mt-6 border border-gray-200 rounded-lg p-4 w-full max-w-md">
                  <p className="italic text-center text-gray-600">
                    &lt;EXPERIMENTAL AREA FOR MODEL COMPARISONS&gt;
                  </p>
                </div>
                <button 
                  onClick={() => handleViewModeChange('focus')}
                  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Return to Focus View
                </button>
              </div>
            )}
          </div>
        </main>
        
        {/* Right sidebar with model selection and Mermaid previews */}
        <aside 
          className="border-l border-gray-200 p-4 overflow-y-auto transition-all duration-500 ease-in-out"
          style={{ width: `${layoutConfig.sidebarWidth}%` }}
        >
          <ModelSidebar />
        </aside>
      </div>
      
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
    </div>
  );
};

export default UnifiedInterface; 