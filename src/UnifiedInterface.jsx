import React, { useState, useMemo, memo, useEffect, useRef, useCallback } from 'react';
import LoopyVisualizer from './components/LoopyVisualizer';
import MermaidDiagram from './components/MermaidDiagram';
import { modelToMermaid, parseModelData } from './utils/mermaidUtils';
import { jsonModels, formatModelName, getModelNames, addModelToLibrary } from './utils/jsonModelLoader';
import { generateThreadSuggestions } from './services/aiThreadService';
import { prepareModelMerge } from './services/modelTransformationService';
import { implementDetailedSuggestion, handleModelMergeWorkflow } from './services/aiModelService';
import { modelToLoopy } from './utils/loopyUtils';
import LandingPage from './components/LandingPage';


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
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                // Call merge model with current title
                handleMergeModel(e, model, title);
              }}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Steal
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Call translate function when implemented
                console.log("Translate clicked for", title);
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Translate
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
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
    <div className="h-48 flex flex-col items-center justify-center p-1 overflow-hidden">
      <div 
        className={`w-full h-full flex items-center justify-center transition-opacity duration-200 ${!isSelected ? 'opacity-70' : 'opacity-100'} overflow-hidden`}
      >
        <MermaidDiagram 
          chart={mermaidCode} 
          config={{ 
            theme: 'neutral',
            fontFamily: 'system-ui, sans-serif',
            flowchart: { curve: 'basis', htmlLabels: true },
            // Add more restrictive sizing to keep diagrams contained
            width: '100%',
            height: '100%',
            fit: true
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
const ModificationThreads = ({ model, forceRefresh }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [customThread, setCustomThread] = useState('');
  const [showDetailView, setShowDetailView] = useState(false);
  
  // State for AI-generated threads
  const [threadOptions, setThreadOptions] = useState([
    { id: 'add_variable', label: 'Add another variable' },
    { id: 'increase_nuance', label: 'Increase nuance' },
    { id: 'simplify', label: 'Simplify' },
  ]);
  
  // State for AI-generated detailed suggestions
  const [threadSuggestions, setThreadSuggestions] = useState({
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
  });
  
  // State for loading status
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch thread suggestions only when explicitly requested (view change or refresh button)
  useEffect(() => {
    if (model && forceRefresh) {
      updateThreadSuggestions();
    }
  }, [model, forceRefresh]);
  
  // Function to update thread suggestions from AI
  const updateThreadSuggestions = async () => {
    setIsLoading(true);
    
    try {
      // Get suggestions from Claude
      const suggestions = await generateThreadSuggestions(model);
      
      if (suggestions && suggestions.threads) {
        // Update thread options
        setThreadOptions(suggestions.threads.map(thread => ({
          id: thread.id,
          label: thread.label
        })));
        
        // Update detailed suggestions
        const detailedSuggestions = {};
        suggestions.threads.forEach(thread => {
          detailedSuggestions[thread.id] = thread.suggestions;
        });
        
        setThreadSuggestions(detailedSuggestions);
      }
    } catch (error) {
      console.error('Error updating thread suggestions:', error);
      // Keep the default suggestions on error
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to manually refresh thread suggestions
  const handleRefreshThreads = () => {
    updateThreadSuggestions();
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
    model = modelToLoopy(model);
    
    // Use the aiModelService to implement the suggestion
    implementDetailedSuggestion(
      model,
      suggestion,
      window.loopyVisualizerRef,
      () => {
        // On success callback
        setShowDetailView(false);
        setSelectedOption(null);
      },
      setIsLoading
    );
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
    const suggestions = threadSuggestions[selectedOption] || [];
    
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
            Thread: {threadOptions.find(opt => opt.id === selectedOption)?.label.replace(' →', '')}
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
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">
          Pull thread to explore
        </h3>
        <button
          onClick={handleRefreshThreads}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="Refresh threads"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <span className="ml-2 text-gray-600">Analyzing model...</span>
        </div>
      ) : (
        <>
          {threadOptions.map((option) => {
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
        </>
      )}
      
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
  // Add state to control whether to show the landing page
  const [showLanding, setShowLanding] = useState(true);
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
  
  // Add state for the current loopy model
  const [currentLoopyModel, setCurrentLoopyModel] = useState(null);
  
  // Add state for thread refresh trigger
  const [threadRefreshTrigger, setThreadRefreshTrigger] = useState(false);
  
  // Reference to the LoopyVisualizer component
  const loopyVisualizerRef = useRef(null);
  
  // Expose the ref globally for ModificationThreads component to use
  // This simplifies the communication between components
  useEffect(() => {
    window.loopyVisualizerRef = loopyVisualizerRef;
    
    // Cleanup on unmount
    return () => {
      window.loopyVisualizerRef = null;
    };
  }, []);
  
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
      showLoopy: true
    }
  };
  
  // Handler for LoopyVisualizer model change events
  const handleLoopyModelChange = (updatedModel) => {
    console.log('Loopy model updated:', updatedModel);
    setCurrentLoopyModel(updatedModel);
  };
  
  // Handle view mode changes
  const handleViewModeChange = (mode) => {
    const previousMode = viewMode;
    setViewMode(mode);
    
    // If changing to integrate view, trigger thread refresh
    if (mode === 'integrate' && previousMode !== 'integrate') {
      setThreadRefreshTrigger(prev => !prev);
    }
  };
  
  // Get current layout configuration
  const layoutConfig = VIEW_MODE_LAYOUTS[viewMode];
  
  // Determine visibility of components based on layout config
  const isModificationThreadsVisible = layoutConfig.showModificationThreads;
  const isLoopyVisible = layoutConfig.showLoopy;
  
  // Determine if we should show models based on view mode
  const shouldShowModels = viewMode === 'explore';
  
  // Grid layout configuration
  const getGridStyle = () => {
    if (!shouldShowModels) return {};
    
    return {
      display: 'grid',
      // Reduce from 3 to 2 columns to give more horizontal space
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '1.5rem',
    };
  };
  
  // Grid class for auto row sizing
  const getGridClass = () => 'auto-rows-max';
  
  // Handler to open modal with a specific model
  const handleExpandModel = (model, title) => {
    setModalModel(model);
    setModalTitle(title || formatModelName(selectedModel));
    setModalOpen(true);
  };
  
  // Handler to open merge modal for merging a model
  const handleMergeModel = (e, model, title) => {
    prepareModelMerge(e, model, title, setModelToMerge, setMergeModelTitle, setMergeModalOpen);
  };
  
  // Handler to directly import a model into the workspace
  const handleImportModel = (e, model, title) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setSelectedModel(getModelNames().find(key => jsonModels[key] === model));
    // Add a small delay to allow state to update and trigger re-render
    setTimeout(() => {
      console.log(`Imported model: ${title}`);
      setCurrentLoopyModel(model);
    }, 100);
  };
  
  // Handler for canceling the merge operation
  const handleCancelMerge = () => {
    // Abort any in-progress API calls
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Reset loading state and close modal
    setLoadingResponse(false);
    setMergeModalOpen(false);
  };
  
  // Handler for submitting feedback and merging the model
  const handleMergeSubmit = (feedback) => {
    handleModelMergeWorkflow(
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
    );
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
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col overflow-hidden">
        {/* Header with title */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Available Models
          </h2>
        </div>
        
        {/* Search Bar */}
        {shouldShowModels && (
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
          {!shouldShowModels ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Models are hidden in focus view</p>
              <button 
                onClick={() => handleViewModeChange('explore')}
                className="mt-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Switch to Explore View
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
                    } h-full flex flex-col overflow-hidden`}
                >
                  <div className="p-4 border-b border-gray-200">
                      <p className="font-medium text-gray-900 truncate">{displayName}</p>
                      <p className="text-sm text-gray-600 mt-1">{description}</p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={(e) => handleImportModel(e, model, displayName)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Import
                        </button>
                        <button
                          onClick={(e) => handleMergeModel(e, model, displayName)}
                          className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                          Steal
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Call translate function when implemented
                            console.log("Translate clicked for", displayName);
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Translate
                        </button>
                      </div>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
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

  // Handlers for landing page actions
  const handleCreateNew = () => {
    // Logic for creating a new model would go here
    // For now, just navigate to the main interface
    setShowLanding(false);
    handleViewModeChange('focus'); // Changed from 'detail'
  };

  const handleBrowseModels = () => {
    // Navigate to the main interface and set to explore view
    setShowLanding(false);
    handleViewModeChange('explore'); // Changed from 'overview'
  };

  // If showing landing page, render it instead of the main interface
  if (showLanding) {
    return <LandingPage 
      onCreateNew={handleCreateNew} 
      onBrowseModels={handleBrowseModels} 
      onSkip={() => {
        setShowLanding(false);
        handleViewModeChange('integrate'); // Changed from 'composition'
      }}
    />;
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Live World Models</h1>
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
        
        {/* Header buttons */}
        <div className="flex items-center space-x-2">
          {/* Home button to return to landing page */}
          <button
            onClick={() => setShowLanding(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center hover:from-purple-600 hover:to-pink-600 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            aria-label="Return to landing page"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          
          {/* Help button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center hover:from-blue-600 hover:to-purple-600 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Help"
          >
            <span className="text-xl font-semibold">?</span>
          </button>
        </div>
      </header>
      
      {/* Main content with sidebar layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar with modification threads (visible only in integrate view and should be on left for other views) */}
        {isModificationThreadsVisible && viewMode !== 'integrate' && (
          <aside className="w-72 transition-all duration-300 ease-in-out">
            <ModificationThreads 
              model={currentLoopyModel} 
              forceRefresh={false}
            />
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
                  ref={loopyVisualizerRef}
                  model={jsonModels[selectedModel]} 
                  title="Workspace" 
                  onModelChange={handleLoopyModelChange}
                />
              </>
            ) : null}
          </div>
        </main>
        
        {/* Right sidebar for model selection (in explore view) or modification threads (in integrate view) */}
        <aside 
          className={`${viewMode === 'integrate' ? 'w-96' : ''} border-l border-gray-200 p-4 overflow-y-auto transition-all duration-500 ease-in-out`}
          style={viewMode !== 'integrate' ? { width: `${layoutConfig.sidebarWidth}%` } : {}}
        >
          {viewMode === 'integrate' && isModificationThreadsVisible ? (
            <ModificationThreads 
              model={currentLoopyModel}
              forceRefresh={threadRefreshTrigger}
            />
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