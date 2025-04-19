import React, { useState, useMemo, memo, useEffect, useRef, useCallback } from 'react';
import LoopyVisualizer from './components/LoopyVisualizer';
import MermaidDiagram from './components/MermaidDiagram';
import { modelToMermaid, parseModelData } from './utils/mermaidUtils';
import { jsonModels, formatModelName, getModelNames, addModelToLibrary } from './utils/jsonModelLoader';
import { sendMessageToClaude } from './services/openRouterService';
import { generateThreadSuggestions } from './services/aiThreadService';
import { threadCompositionSystemPrompt } from './utils/prompts';
import { structuralCompositionSystemPrompt } from './utils/prompts';
import { modelToLoopy } from './utils/loopyUtils';

// Landing Page component
const LandingPage = ({ onCreateNew, onBrowseModels, onSkip }) => {
  // Add state for tooltip visibility
  const [showTooltip, setShowTooltip] = useState(false);
  
  // State for the "Create New Model" button interaction
  const [buttonState, setButtonState] = useState('idle'); // 'idle', 'holding', 'loading', 'input'
  const [pressStartTime, setPressStartTime] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const holdTimeoutRef = useRef(null);
  const loadingIntervalRef = useRef(null);
  
  // State for the "Models... of what?" button and its children
  const [showChildButtons, setShowChildButtons] = useState(false);
  const [selectedChildButtons, setSelectedChildButtons] = useState({});
  
  // Function to handle icon click
  const handleIconClick = (e) => {
    e.preventDefault();
    setShowTooltip(true);
    
    // Hide tooltip after 3 seconds
    setTimeout(() => {
      setShowTooltip(false);
    }, 1500);
  };
  
  const resetLoadingState = () => {
    clearTimeout(holdTimeoutRef.current);
    clearInterval(loadingIntervalRef.current);
    holdTimeoutRef.current = null;
    loadingIntervalRef.current = null;
    setButtonState('idle');
    setLoadingProgress(0);
    setPressStartTime(null);
  };
  
  const handleMouseDown = () => {
    setButtonState('holding');
    setPressStartTime(Date.now());

    // Start timeout to transition to loading/input after 1 second
    holdTimeoutRef.current = setTimeout(() => {
      setButtonState('loading');
      
      // Start loading bar animation (0 to 100% over 1 second)
      const loadingDuration = 1000; // 1 second
      const startTime = Date.now();
      
      loadingIntervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / loadingDuration, 1);
        setLoadingProgress(progress);

        if (progress >= 1) {
          clearInterval(loadingIntervalRef.current);
          setButtonState('input');
        }
      }, 16); // ~60fps update

    }, 500); // Start loading after 0.5 seconds of holding
  };
  
  const handleMouseUp = () => {
    if (buttonState === 'holding') {
      const pressDuration = Date.now() - pressStartTime;
      if (pressDuration < 500) {
        // Short click: execute original action
        onCreateNew();
      }
    }
    // If state is 'loading' or 'input', releasing the mouse doesn't revert it
    // Only reset if it was just 'holding' or if leaving the button area
    if (buttonState === 'holding') {
       resetLoadingState();
    }
  };
  
  const handleMouseLeave = () => {
    // If mouse leaves while holding (before transition), reset
    if (buttonState === 'holding') {
      resetLoadingState();
    }
  };
  
  // Function to toggle child buttons
  const handleToggleChildButtons = () => {
    setShowChildButtons(!showChildButtons);
    // If showing child buttons, also transition to input mode
    if (!showChildButtons) {
      setButtonState('input');
    }
  };

  // Function to handle child button click
  const handleChildButtonClick = (id) => {
    setSelectedChildButtons(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Cleanup timeouts/intervals on unmount
  useEffect(() => {
    return () => {
      clearTimeout(holdTimeoutRef.current);
      clearInterval(loadingIntervalRef.current);
    };
  }, []);
  
  return (
    <div className="h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Live World Models</h1>
        <button
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto p-8">
          {/* Hero section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8 relative">
              {/* Earth icon with glow effect on hover */}
              <div 
                className="relative w-32 h-32 cursor-pointer group"
                onClick={handleIconClick}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-20 animate-pulse group-hover:animate-none group-hover:opacity-0 transition-opacity duration-300"></div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-30 group-hover:opacity-0 transition-opacity duration-300"></div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-300 to-blue-600 opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                
                {/* Earth icon */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center transition-all duration-300 group-hover:from-blue-500 group-hover:to-blue-800">
                  <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                {/* Easter egg tooltip */}
                {showTooltip && (
                  <div className="absolute bottom-0 left-1/2 transform translate-y-full -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-80 whitespace-nowrap">
                    Ceci n'est pas le monde.
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-b-gray-900"></div>
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Live World Models</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Explore, create, and analyze causal loop diagrams. 
              Visualize complex systems and intuitively understand their behavior!
            </p>
            
            {/* "Models... of what?" button and child toggles */}
            <div className="mb-8">
              <button 
                onClick={handleToggleChildButtons}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
              >
                Models... of what?
              </button>
              
              {showChildButtons && (
                <>
                  <p className="mt-8 text-sm text-gray-600 text-center">
                    Anything you like! Some potential domains include:
                  </p>
                  <div className="mt-4 flex justify-center space-x-2">
                    {[
                      { id: 'environment', label: 'Environment' },
                      { id: 'technology', label: 'Technology' },
                      { id: 'culture', label: 'Culture' },
                      { id: 'geopolitics', label: 'Geopolitics' },
                      { id: 'relationships', label: 'Relationships' }
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => handleChildButtonClick(id)}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                          selectedChildButtons[id]
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Action buttons - made more central and prominent */}
            <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-blue-100 mb-12">
              <div className="flex flex-col space-y-4">
                <div 
                  className={`relative px-8 py-5 ${buttonState !== 'input' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-white border border-gray-300'} text-white text-xl font-bold rounded-lg shadow-lg ${buttonState !== 'input' ? 'hover:from-green-600 hover:to-green-700' : ''} transition-all duration-300 flex items-center justify-center ${buttonState !== 'input' ? 'transform hover:scale-105 cursor-pointer' : ''}`}
                  onMouseDown={buttonState !== 'input' ? handleMouseDown : undefined}
                  onMouseUp={buttonState !== 'input' ? handleMouseUp : undefined}
                  onMouseLeave={buttonState !== 'input' ? handleMouseLeave : undefined}
                  style={{ minHeight: '76px' }} // Ensure consistent height
                >
                  {buttonState === 'input' ? (
                    <div className="relative w-full h-full flex items-center">
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Describe the model you want to create..."
                        className="w-full h-24 pl-3 pr-10 py-2 text-base font-normal text-gray-700 bg-transparent border-none rounded-lg resize-none focus:outline-none focus:ring-0"
                        maxLength={500} // Example max length
                      />
                      <button
                        onClick={onSkip} // Reuse the onSkip handler
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-full hover:bg-green-100 transition-all"
                        aria-label="Confirm input"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Loading Bar Overlay */}
                      {buttonState === 'loading' && (
                        <div className="absolute inset-0 rounded-lg overflow-hidden">
                           <div 
                             className="h-full bg-gradient-to-r from-green-400 to-green-600 opacity-75 transition-all duration-100 ease-linear"
                             style={{ width: `${loadingProgress * 100}%` }}
                           ></div>
                        </div>
                      )}
                      {/* Button Content */}
                      <div className="relative z-10 flex items-center justify-center w-full">
                        <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create New Model
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center text-gray-500 font-medium my-1">or</div>
                <button 
                  onClick={onBrowseModels}
                  className="px-8 py-5 bg-white text-blue-700 text-xl font-bold rounded-lg shadow-md border-2 border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center transform hover:scale-105"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Browse Models
                </button>
              </div>
            </div>
          </div>
          
          {/* Feature showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Programming</h3>
              <p className="text-gray-600">Draw, browse, and compose dynamic causal loop diagrams for modelling complex systems.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M5 5L19 19M19 5L5 19" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Category Theory</h3>
              <p className="text-gray-600">Category theory brings mathematical rigor and coherence to practical system modeling.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Enlivened Analysis</h3>
              <p className="text-gray-600">Auto-structuring helps identify accuracy improvements, merge models, and extract insights.</p>
            </div>
          </div>
          
          {/* Sample model visualization */}
          <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden mb-16">
            <h3 className="text-lg font-semibold mb-4">Sample Model Preview</h3>
            <div className="h-128 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
              <div className="max-w-lg w-full">
                <MermaidDiagram 
                  chart={`graph TD
                    A[Economic Growth] -->|+| B[Resource Consumption]
                    B -->|+| C[Environmental Degradation]
                    C -->|-| A
                    D[Technological Innovation] -->|-| B
                    D -->|+| A`} 
                  config={{ 
                    theme: 'neutral',
                    fontFamily: 'system-ui, sans-serif',
                    flowchart: { curve: 'basis', htmlLabels: true }
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="w-full bg-white border-t border-gray-200 py-6 pb-0">
            <div className="w-full px-4 text-center">
              <p className="text-gray-500">Live Theory © 2025 — Built to aid category theory analyses via causal loop diagrams.</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

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
    { id: 'add_variable', label: 'Add another variable', description: 'Pull this thread to introduce a new factor to the system' },
    { id: 'increase_nuance', label: 'Increase nuance', description: 'Unravel this thread to add more detail to existing relationships' },
    { id: 'simplify', label: 'Simplify', description: 'Follow this thread to reduce complexity while preserving key dynamics' },
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
          label: thread.label,
          description: thread.description
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
    // Log the selected suggestion
    console.log(`Implementing suggestion: ${suggestion.title}`);
    model = modelToLoopy(model);

    // If there's no model, we can't do anything
    if (!model || !model.nodes) {
      console.error('Cannot implement suggestion - no valid model available');
      return;
    }
    
    // Prepare a system prompt for Claude to implement the suggestion
    const systemPrompt = `
    You are an AI assistant specialized in causal modeling.
    Your task is to implement a specific modification to a causal model.
    
    The current model will be provided in a simplified JSON format.
    
    Return ONLY the modified model as a valid JSON object with the following structure:
    {
      "nodes": [
        { "id": "node_id", "name": "Node Name" },
        // more nodes...
      ],
      "edges": [
        { "from": "source_node_id", "to": "target_node_id", "type": "positive|negative" },
        // more edges...
      ],
      "theory": "causal-loop",
      "type": "model"
    }
    
    Do not include any explanation or additional text, only return valid JSON.
    Ensure all node IDs are unique and edges reference valid node IDs.
    Make minimal changes to implement the requested modification.
    `;
    
    // Prepare the model in a simplified format for Claude
    const simplifiedModel = {
      nodes: model.nodes.map(n => ({ id: n.id.toString(), name: n.name })),
      edges: (model.edges || []).map(e => ({ 
        from: e.from.toString(), 
        to: e.to.toString(), 
        type: e.strength < 0 ? 'negative' : 'positive' 
      })),
      theory: model.theory || 'causal-loop',
      type: 'model'
    };
    
    // Prepare user message with the model and the suggestion
    const userMessage = `
    Here is the current causal model:
    ${JSON.stringify(simplifiedModel, null, 2)}
    
    Implement this modification: "${suggestion.title}"
    Description: ${suggestion.description}
    
    Return the modified model.
    `;
    
    // Show loading state
    setIsLoading(true);
    
    // Send to Claude
    sendMessageToClaude(userMessage, threadCompositionSystemPrompt)
      .then(response => {
        try {
          // Extract JSON from the response
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          let modifiedModel;
          
          if (jsonMatch) {
            modifiedModel = JSON.parse(jsonMatch[0]);
          } else {
            // If no JSON pattern found, try parsing directly
            modifiedModel = JSON.parse(response);
          }
          
          // Clear the detail view and selection after implementation
          setShowDetailView(false);
          setSelectedOption(null);
          
          // Convert to Loopy format for direct update
          // This simplified version doesn't rely on global event
          const loopyFormat = {
            nodes: modifiedModel.nodes.map((node, index) => ({
              id: parseInt(node.id) || index,
              name: node.name || `Node ${index + 1}`,
              x: Math.random() * 800 + 100, // Random position
              y: Math.random() * 400 + 50,  // Random position
              hue: index % 6  // Color based on index
            })),
            edges: modifiedModel.edges.map((edge, index) => ({
              id: index,
              from: parseInt(edge.from) || 0,
              to: parseInt(edge.to) || 0,
              strength: edge.type === 'negative' ? -1 : 1,
              arc: 0
            })),
            labels: []
          };
          
          // Find the Loopy visualizer reference in the parent UnifiedInterface
          // and update the model directly
          if (window.loopyVisualizerRef && window.loopyVisualizerRef.current) {
            window.loopyVisualizerRef.current.updateModel(loopyFormat);
            console.log('Updated Loopy model via global ref');
          } else {
            console.error('Could not find global loopyVisualizerRef');
          }
          
        } catch (error) {
          console.error('Error parsing modified model:', error);
        } finally {
          setIsLoading(false);
        }
      })
      .catch(error => {
        console.error('Error implementing suggestion:', error);
        setIsLoading(false);
      });
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
    e.stopPropagation(); // Prevent triggering the parent onClick
    setModelToMerge(model);
    setMergeModelTitle(title);
    setMergeModalOpen(true);
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
        structuralCompositionSystemPrompt, 
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