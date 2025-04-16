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
  const [customThread, setCustomThread] = useState('');
  const [showDetailView, setShowDetailView] = useState(false);

  // Options based on the image with updated "pull" language
  const options = [
    { id: 'add_variable', label: 'Add another variable', description: 'Pull this thread to introduce a new factor to the system' },
    { id: 'increase_nuance', label: 'Increase nuance', description: 'Unravel this thread to add more detail to existing relationships' },
    { id: 'simplify', label: 'Simplify', description: 'Follow this thread to reduce complexity while preserving key dynamics' },
  ];
  
  // Detailed suggestions for each option
  const detailedSuggestions = {
    add_variable: [
      { 
        id: 'vegetation', 
        title: 'Vegetation',
        description: 'Would have a positive effect on rabbits (more food = more rabbits) and could create a three-variable causal loop where: more vegetation → more rabbits → more foxes → fewer rabbits → more vegetation (as fewer rabbits consume less vegetation).'
      },
      { 
        id: 'disease', 
        title: 'Disease',
        description: 'Could affect either fox or rabbit populations negatively, introducing a new dynamic where disease outbreaks might temporarily disrupt the predator-prey balance, causing population oscillations.'
      },
      { 
        id: 'human_hunting', 
        title: 'Human is Hunting',
        description: 'Would have a negative effect on fox populations, potentially leading to rabbit population booms when fox numbers are reduced, which could then lead to vegetation depletion.'
      }
    ],
    increase_nuance: [
      { 
        id: 'age_structure', 
        title: 'Age Structure',
        description: 'Adding age categories to rabbits and foxes would allow for more realistic reproduction and mortality rates.'
      },
      { 
        id: 'seasonal_effects', 
        title: 'Seasonal Effects',
        description: 'Introduce temporal dynamics where predator-prey relationships change throughout the year.'
      }
    ],
    simplify: [
      { 
        id: 'linear_relationship', 
        title: 'Linear Relationship',
        description: 'Simplify the feedback loops to focus only on the direct relationship between foxes and rabbits.'
      },
      { 
        id: 'population_equilibrium', 
        title: 'Population Equilibrium',
        description: 'Focus on the equilibrium point rather than the dynamics leading to it.'
      }
    ],
    explore_more: [
      { 
        id: 'habitat_fragmentation', 
        title: 'Habitat Fragmentation',
        description: 'Explore how dividing the ecosystem into separate regions affects population dynamics.'
      },
      { 
        id: 'genetic_adaptation', 
        title: 'Genetic Adaptation',
        description: 'Model how foxes and rabbits might evolve strategies over time in response to each other.'
      }
    ]
  };
  
  const handleOptionClick = (option) => {
    if (selectedOption === option.id) {
      // If already selected, toggle detail view
      setShowDetailView(!showDetailView);
    } else {
      // If new option selected, show the details
      setSelectedOption(option.id);
      setShowDetailView(true);
    }
  };

  const handleDetailedSuggestionClick = (suggestion) => {
    // This would handle implementing the suggestion
    console.log(`Implementing suggestion: ${suggestion.title}`);
    // In a real implementation, this would add the variable to the model
  };

  const handleBackClick = () => {
    setShowDetailView(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customThread.trim()) {
      // Handle custom thread submission
      console.log('Custom thread:', customThread);
      setCustomThread('');
    }
  };
  
  // If showing detail view, render the suggestions for the selected option
  if (showDetailView && selectedOption) {
    const suggestions = detailedSuggestions[selectedOption] || [];
    
    return (
      <div className="h-full flex flex-col p-4 overflow-auto">
        <div className="mb-4 flex items-center">
          <button 
            onClick={handleBackClick}
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-800">
            Thread: {options.find(opt => opt.id === selectedOption)?.label.replace(' →', '')}
          </h3>
        </div>
        
        <div className="space-y-4 mb-4">
          {suggestions.map(suggestion => (
            <div 
              key={suggestion.id}
              className="p-4 border border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer transition-all duration-200 hover:-translate-x-1"
              onClick={() => handleDetailedSuggestionClick(suggestion)}
            >
              <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
              <p className="text-sm text-gray-700">{suggestion.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Describe what you'd like in more detail</p>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (customThread.trim()) {
                console.log('Custom detail:', customThread);
                setCustomThread('');
              }
            }} 
            className="flex items-center"
          >
            <input
              type="text"
              value={customThread}
              onChange={(e) => setCustomThread(e.target.value)}
              placeholder="Add more specifics about this thread..."
              className="flex-1 px-3 py-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none transition-colors"
            />
            <button
              type="submit"
              className="ml-2 text-blue-500 hover:text-blue-700"
              disabled={!customThread.trim()}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  // Otherwise show the main thread options
  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Pull thread to explore
      </h3>
      
      {options.map((option) => {
        const isSelected = option.id === selectedOption;
        
        return (
          <div 
            key={option.id}
            className={`flex flex-col p-3.5 rounded-lg border ${
              isSelected 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            } cursor-pointer transition-all duration-200 shadow-sm hover:-translate-x-1`}
            onClick={() => handleOptionClick(option)}
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-medium text-gray-800">{option.label} {option.id !== 'explore_more' ? '→' : ''}</span>
            </div>
            {isSelected && !showDetailView && (
              <p className="mt-2 text-sm text-gray-600">{option.description}</p>
            )}
          </div>
        );
      })}
      
      {/* Custom thread input - now part of the list */}
      <form 
        onSubmit={handleCustomSubmit} 
        className="flex flex-col p-3.5 rounded-lg border border-dashed border-gray-300 bg-white hover:border-blue-400 transition-all duration-200"
      >
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            value={customThread}
            onChange={(e) => setCustomThread(e.target.value)}
            placeholder="What would you like to pull on..."
            className="flex-1 bg-transparent border-none outline-none text-gray-800 font-medium placeholder-gray-400"
          />
          <button
            type="submit"
            className="ml-2 text-blue-500 hover:text-blue-700"
            disabled={!customThread.trim()}
          >
            →
          </button>
        </div>
      </form>
      
      <div className="flex-1"></div> {/* Spacer to push content to top */}
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

// Help modal component for displaying help content
const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600">
          <h3 className="text-xl font-semibold text-white">Help Center</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="prose prose-sm max-w-none">
            {/* Help content will be added later */}
            <h4 className="font-medium text-gray-900">Getting Started</h4>
            <p className="text-gray-700">
              Help content will be added here. This section will include instructions on how to use the application.
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
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
  
  // Add state for showing help modal
  const [showHelpModal, setShowHelpModal] = useState(false);
  
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
      showModificationThreads: false,
      showLoopy: true
    },
    integrate: {
      sidebarWidth: 0, // No models visible
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
        // If we can't parse the JSON, just show the text response
        setClaudeResponse(`Claude provided a response but it couldn't be parsed as a valid model. Here's what Claude said: ${claudeResponse}`);
        
        // Close merge modal and show response modal
        setMergeModalOpen(false);
        setShowResponseModal(true);
        
        // Just use the model that was selected to be merged
        setSelectedModel(modelToMergeName);
      }
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
      <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Causal Modelling of Systems</h1>
          <p className="text-sm text-gray-500">Visualize and analyze complex system dynamics</p>
        </div>
        
        {/* View mode selector - centered */}
        <div className="flex-1 flex justify-center">
          <div className="w-64 flex flex-col items-center">
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
        </div>
        
        {/* Help button */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center hover:from-blue-600 hover:to-purple-600 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Help"
        >
          <span className="text-xl font-semibold">?</span>
        </button>
      </header>
      
      {/* Main content with sidebar layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar with modification threads (visible only in integrate view and should be on left for other views) */}
        {isModificationThreadsVisible && viewMode !== 'integrate' && (
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
        
        {/* Right sidebar for model selection (in explore view) or modification threads (in integrate view) */}
        <aside 
          className={`${viewMode === 'integrate' ? 'w-96' : ''} border-l border-gray-200 p-4 overflow-y-auto transition-all duration-500 ease-in-out`}
          style={viewMode !== 'integrate' ? { width: `${layoutConfig.sidebarWidth}%` } : {}}
        >
          {viewMode === 'integrate' && isModificationThreadsVisible ? (
            <ModificationThreads />
          ) : (
            <ModelSidebar />
          )}
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
      
      {/* Help modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
};

export default UnifiedInterface; 