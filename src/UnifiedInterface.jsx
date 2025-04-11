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
  
  // Note: This will now use the central grid layout functions from UnifiedInterface
  // Get CSS grid template columns for proper sizing
  const getGridStyle = () => {
    // For the overlay, always use 3 columns for consistent layout
    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '1rem',
    };
  };
  
  // Get the appropriate grid class based on column count
  const getGridClass = () => {
    return 'auto-rows-max';
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
              <div className={`${getGridClass()}`} style={getGridStyle()}>
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

// Side wheel component with curved list of options
const SideWheel = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hoverOption, setHoverOption] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const wheelRef = useRef(null);
  
  // Expanded list of options with many more items
  const options = [
    { id: 'M1', label: 'M1', description: 'Visualization' },
    { id: 'M2', label: 'M2', description: 'Properties' },
    { id: 'M3', label: 'M3', description: 'Elements' },
    { id: 'M4', label: 'M4', description: 'Relations' },
    { id: 'M5', label: 'M5', description: 'Simulation' },
    { id: 'M6', label: 'M6', description: 'Share' },
    { id: 'M7', label: 'M7', description: 'Export' },
    { id: 'M8', label: 'M8', description: 'Templates' },
    { id: 'M9', label: 'M9', description: 'Settings' },
    { id: 'M10', label: 'M10', description: 'Analysis' },
    { id: 'M11', label: 'M11', description: 'Compare' },
    { id: 'M12', label: 'M12', description: 'History' },
    { id: 'M13', label: 'M13', description: 'Permissions' },
    { id: 'M14', label: 'M14', description: 'Import' },
    { id: 'M15', label: 'M15', description: 'Preview' },
    { id: 'M16', label: 'M16', description: 'Graphics' },
    { id: 'M17', label: 'M17', description: 'Optimize' },
    { id: 'M18', label: 'M18', description: 'Collaborate' },
    { id: 'M19', label: 'M19', description: 'Validate' },
    { id: 'M20', label: 'M20', description: 'Publish' }
  ];

  const CARD_HEIGHT = 200; // Increased card height (3x)
  const CARD_SPACING = 40; // Space between cards
  const TOTAL_ITEM_HEIGHT = CARD_HEIGHT + CARD_SPACING;
  const VISIBLE_ITEMS = 4; // Number of fully visible items
  
  const handleOptionClick = (option) => {
    setSelectedOption(option.id === selectedOption ? null : option.id);
    console.log(`Selected option: ${option.label} - ${option.description}`);
  };

  const handleWheel = (e) => {
    if (wheelRef.current) {
      e.preventDefault();
      const newPosition = scrollPosition + e.deltaY;
      
      // Calculate total scroll height for all items
      const totalHeight = options.length * TOTAL_ITEM_HEIGHT;
      
      // Implement cyclic scrolling
      let adjustedPosition = newPosition % totalHeight;
      if (adjustedPosition > 0) {
        adjustedPosition -= totalHeight;
      }
      
      setScrollPosition(adjustedPosition);
    }
  };
  
  // Function to get cyclic index
  const getCyclicIndex = (index, length) => {
    return ((index % length) + length) % length;
  };
  
  return (
    <div className="h-full relative overflow-hidden" onWheel={handleWheel}>
      {/* Roulette wheel background structure - wider to accommodate larger cards */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white"
        style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0 100%)' }}
      >
        <div className="absolute left-0 top-0 w-full h-full overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 600 800" preserveAspectRatio="none">
            {/* Main curve outline - adjusted for wider cards */}
            <path 
              d="M 60,20 Q 20,400 60,780" 
              fill="none" 
              stroke="#e5e7eb" 
              strokeWidth="1.5"
              className="opacity-80"
            />
            
            {/* Radial lines - adjusted spacing for taller cards */}
            {[...Array(40)].map((_, i) => {
              const y = i * (CARD_HEIGHT / 4);
              const x1 = 20;
              const x2 = 100;
              
              return (
                <line 
                  key={i}
                  x1={x1} 
                  y1={y} 
                  x2={x2} 
                  y2={y} 
                  stroke="#e5e7eb"  
                  strokeWidth="0.5"
                  strokeDasharray="1,2"
                  className="opacity-50"
                />
              );
            })}
            
            {/* Inner curve outline */}
            <path 
              d="M 40,40 Q 10,400 40,760" 
              fill="none" 
              stroke="#e5e7eb" 
              strokeWidth="1"
              className="opacity-60"
            />
          </svg>
        </div>
      </div>
      
      {/* Items container with cyclic scrolling */}
      <div 
        ref={wheelRef}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <div 
          className="relative w-full h-full"
          style={{
            transition: 'transform 0.3s ease-out',
            transform: `translateY(${scrollPosition}px)`
          }}
        >
          {/* Generate extra items for smooth cyclic scrolling */}
          {[...Array(VISIBLE_ITEMS + 3)].map((_, i) => {
            const virtualIndex = Math.floor(Math.abs(scrollPosition) / TOTAL_ITEM_HEIGHT) - 1 + i;
            const actualIndex = getCyclicIndex(virtualIndex, options.length);
            const option = options[actualIndex];
            
            const basePosition = virtualIndex * TOTAL_ITEM_HEIGHT;
            const adjustedPosition = basePosition + scrollPosition;
            
            // Calculate visibility and position
            const yCenter = window.innerHeight / 2;
            const distFromCenter = adjustedPosition - yCenter;
            const xOffset = Math.pow(Math.abs(distFromCenter) / 400, 2) * 20;
            const isInView = Math.abs(distFromCenter) < yCenter + CARD_HEIGHT;
            const opacity = isInView ? 1 : 0;
            
            const isSelected = option.id === selectedOption;
            const isHovered = option.id === hoverOption;
            
            return (
              <div 
                key={`${option.id}-${virtualIndex}`}
                className={`absolute flex items-start justify-start px-8 py-6
                         transition-all duration-200 cursor-pointer rounded-lg
                         ${isSelected 
                           ? 'bg-blue-600 text-white shadow-lg' 
                           : isHovered && isInView
                             ? 'bg-blue-100 text-blue-800 shadow-md' 
                             : 'bg-white text-blue-700 border border-gray-100'
                         }`}
                style={{
                  top: `${basePosition}px`,
                  left: `${xOffset}px`,
                  width: 'calc(100% - 20px)',
                  height: `${CARD_HEIGHT}px`,
                  zIndex: isSelected ? 20 : isHovered ? 15 : 10,
                  opacity: opacity,
                  transform: `translateX(0) rotate(${distFromCenter !== 0 ? (distFromCenter / yCenter) * 0.5 : 0}deg)`,
                  transformOrigin: 'left center',
                  pointerEvents: isInView ? 'auto' : 'none',
                }}
                onClick={() => isInView && handleOptionClick(option)}
                onMouseEnter={() => isInView && setHoverOption(option.id)}
                onMouseLeave={() => isInView && setHoverOption(null)}
                title={option.description}
              >
                <div className="flex flex-col w-full h-full">
                  <div className={`flex items-center justify-center h-16 rounded-full
                    ${isSelected ? 'bg-white bg-opacity-20' : 'bg-blue-50'}`
                  }>
                    <span className={`font-medium text-2xl ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                      {option.label}
                    </span>
                  </div>
                  <div className="flex-1"></div>
                </div>
              </div>
            );
          })}
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
  // Add a new state for the view mode 
  const [viewMode, setViewMode] = useState('detail'); // Options: 'detail', 'composition', 'overview'
  
  // Add state for sidebar width (1-4 models wide)
  const [sidebarWidth, setSidebarWidth] = useState(0); // Width percentage (0% = detail, 20% = composition, 65% = overview)
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle view mode changes
  const handleViewModeChange = (mode) => {
    console.log(`View mode changed to: ${mode}`);
    setViewMode(mode);
    
    // Set fixed sidebar width based on view mode
    if (mode === 'detail') {
      setSidebarWidth(0); // No models visible
    } else if (mode === 'composition') {
      setSidebarWidth(20); // One model column
    } else if (mode === 'overview') {
      setSidebarWidth(65); // Full library view
    }
  };
  
  // Handle mouse down on the resize handle
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  // Handle mouse move while dragging
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const containerWidth = document.body.clientWidth;
    const mouseX = e.clientX;
    const newWidth = Math.round(100 - (mouseX / containerWidth * 100));
    
    // Snap to one of the three positions based on drag position
    if (newWidth < 10) {
      setSidebarWidth(0);
      setViewMode('detail');
    } else if (newWidth < 40) {
      setSidebarWidth(20);
      setViewMode('composition');
    } else {
      setSidebarWidth(65);
      setViewMode('overview');
    }
  };
  
  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  // Determine visibility of components based on view mode
  const isSideWheelVisible = sidebarWidth < 40; // Visible in detail and composition views
  const isLoopyVisible = sidebarWidth < 40; // Show Loopy in detail and composition views
  
  // Dynamically determine grid columns based on width
  const getGridColumns = () => {
    if (sidebarWidth < 10) return 0; // No models visible in detail view
    if (sidebarWidth < 25) return 1; // One model column in composition view
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
    
    // Determine if sidebar content should be shown based on view mode
    const showSidebarContent = getGridColumns() > 0;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col overflow-hidden">
        {/* Header with title and expand/collapse indicator */}
        <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => setLibraryOpen(true)}
          className="text-lg font-semibold text-gray-700 hover:text-blue-600 focus:outline-none text-left"
        >
          Available Models
        </button>
          
          <button
            onClick={() => {
              const nextMode = viewMode === 'detail' ? 'composition' 
                : viewMode === 'composition' ? 'overview' 
                : 'detail';
              handleViewModeChange(nextMode);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            title="Toggle view"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={viewMode === 'overview' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
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
              <p className="text-gray-500">Models are hidden in detail view</p>
              <button 
                onClick={() => handleViewModeChange('composition')}
                className="mt-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Switch to Composition View
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
      <header className="bg-white shadow-sm px-6 py-3">
        <h1 className="text-2xl font-bold text-gray-800">CatCoLab Loopy Visualizer</h1>
      </header>
      
      {/* Main content with sidebar layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar with wheel (visible in detail and composition views) */}
        {isSideWheelVisible && (
          <aside className="w-56 transition-all duration-300 ease-in-out">
            <SideWheel />
          </aside>
        )}
        
        {/* Main visualization area with Loopy or placeholder */}
        <main 
          className="transition-all duration-300 ease-in-out overflow-auto p-6 flex-1"
          style={{ width: isSideWheelVisible ? `calc(100% - ${sidebarWidth}% - 56px)` : `calc(100% - ${sidebarWidth}%)` }}
        >
          <div className="bg-white rounded-lg shadow-md p-6 h-full relative">
            {isLoopyVisible ? (
              <>
                {/* Visual indicator connecting the side wheel to Loopy interface */}
                {isSideWheelVisible && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 w-6 h-32 flex items-center justify-start">
                    <svg width="24" height="120" viewBox="0 0 24 120" fill="none">
                      <path d="M0,60 C14,60 20,30 24,0 L24,120 C20,90 14,60 0,60 Z" fill="#f9fafb" />
                      <path d="M0,60 C14,60 20,30 24,0 L24,120 C20,90 14,60 0,60 Z" stroke="#e5e7eb" strokeWidth="1" fill="none" />
                    </svg>
                  </div>
                )}
                <LoopyVisualizer 
                  model={selectedModel ? jsonModels[selectedModel] : null} 
                  title="Loopy Interactive Model" 
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
                  The library overview mode provides a comprehensive view of available models.
                </p>
                <div className="mt-6 border border-gray-200 rounded-lg p-4 w-full max-w-md">
                  <p className="italic text-center text-gray-600">
                    &lt;EXPERIMENTAL AREA FOR MODEL COMPARISONS&gt;
                  </p>
                </div>
                <button 
                  onClick={() => handleViewModeChange('detail')}
                  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Return to Detail View
                </button>
              </div>
            )}
          </div>
        </main>
        
        {/* Resize handle */}
        <div 
          className={`flex flex-col items-center justify-center py-6 cursor-col-resize hover:bg-blue-100 active:bg-blue-200 z-10 ${isDragging ? 'bg-blue-100' : 'bg-gray-50'}`}
          onMouseDown={handleMouseDown}
          style={{ width: '12px' }}
        >
          <div className="flex flex-col items-center space-y-1 opacity-50">
            <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
        
        {/* Right sidebar with model selection and Mermaid previews */}
        <aside 
          className="border-l border-gray-200 p-4 overflow-y-auto transition-all duration-500 ease-in-out"
          style={{ width: `${sidebarWidth}%` }}
        >
          <ModelSidebar />
        </aside>
      </div>
      
      {/* Replace footer with view mode selector */}
      <div className="bg-white shadow-inner py-4 flex justify-center items-center">
        <div className="w-1/3 flex flex-col items-center">
          <div className="flex justify-between w-full mb-2">
            <span className={`text-xs font-medium transition-colors duration-200 ${viewMode === 'detail' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>Detail View</span>
            <span className={`text-xs font-medium transition-colors duration-200 ${viewMode === 'composition' ? 'text-purple-600 font-semibold' : 'text-gray-500'}`}>Composition</span>
            <span className={`text-xs font-medium transition-colors duration-200 ${viewMode === 'overview' ? 'text-pink-600 font-semibold' : 'text-gray-500'}`}>Overview</span>
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
                left: viewMode === 'detail' ? '0%' : viewMode === 'composition' ? '50%' : '100%',
                transform: 'translateX(-50%)',
                width: '12px'
              }}
            ></div>
            
            {/* Mode selection buttons */}
            <div className="flex justify-between w-full absolute top-1/2 -mt-3 z-0">
              <button 
                className={`w-6 h-6 rounded-full shadow transition-all duration-300 flex items-center justify-center 
                  ${viewMode === 'detail' ? 'bg-blue-500 ring-4 ring-blue-200 scale-110' : 'bg-white border border-gray-300'}`}
                onClick={() => handleViewModeChange('detail')}
              >
                {viewMode === 'detail' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </button>
              <button 
                className={`w-6 h-6 rounded-full shadow transition-all duration-300 flex items-center justify-center 
                  ${viewMode === 'composition' ? 'bg-purple-500 ring-4 ring-purple-200 scale-110' : 'bg-white border border-gray-300'}`}
                onClick={() => handleViewModeChange('composition')}
              >
                {viewMode === 'composition' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </button>
              <button 
                className={`w-6 h-6 rounded-full shadow transition-all duration-300 flex items-center justify-center 
                  ${viewMode === 'overview' ? 'bg-pink-500 ring-4 ring-pink-200 scale-110' : 'bg-white border border-gray-300'}`}
                onClick={() => handleViewModeChange('overview')}
              >
                {viewMode === 'overview' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </button>
            </div>
          </div>
        </div>
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