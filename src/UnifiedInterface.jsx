import React, { useState, useMemo, memo, useEffect, useRef } from 'react';
import LoopyVisualizer from './components/LoopyVisualizer';
import MermaidDiagram from './components/MermaidDiagram';
import { modelToMermaid, parseModelData } from './utils/mermaidUtils';
import { jsonModels, formatModelName, getModelNames } from './utils/jsonModelLoader';

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

// Feedback modal for "Steal This" functionality
const FeedbackModal = ({ isOpen, onClose, model, title, onSubmit }) => {
  const [feedback, setFeedback] = useState('');
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Steal Model</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <p className="mb-4">What do you like about <span className="font-medium">{title}</span>?</p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Share your thoughts..."
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                onSubmit(feedback);
                setFeedback('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Steal
            </button>
          </div>
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

const UnifiedInterface = () => {
  const [selectedModel, setSelectedModel] = useState('wolfchickens.json');
  const [modelNames, setModelNames] = useState([]);
  const [showAdvancedMermaid, setShowAdvancedMermaid] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackModel, setFeedbackModel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalModel, setModalModel] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  
  // Add state for model library overlay
  const [libraryOpen, setLibraryOpen] = useState(false);
  
  // Add state for feedback modal
  const [feedbackTitle, setFeedbackTitle] = useState('');
  
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
  
  // Handler to open feedback modal for stealing a model
  const handleStealModel = (e, model, title) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    setFeedbackModel(model);
    setFeedbackTitle(title);
    setFeedbackModalOpen(true);
  };
  
  // Handler for submitting feedback and stealing the model
  const handleStealSubmit = (feedback) => {
    console.log('User feedback:', feedback);
    setSelectedModel(getModelNames().find(key => jsonModels[key] === feedbackModel));
    setFeedbackModalOpen(false);
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
                      onClick={(e) => handleStealModel(e, model, displayName)}
                      className="mt-2 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Steal
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
      
      {/* Feedback modal for stealing models */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        model={feedbackModel}
        title={feedbackTitle}
        onSubmit={handleStealSubmit}
      />
      
      {/* Model Library Overlay */}
      <ModelLibraryOverlay
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        models={jsonModels}
        onSelectModel={(model, title) => {
          setModalModel(model);
          setModalTitle(title);
          setModalOpen(true);
          setLibraryOpen(false);
        }}
      />
    </div>
  );
};

export default UnifiedInterface; 