import React, { useState, useMemo, memo, useEffect, useRef } from 'react';
import LoopyVisualizer from './components/LoopyVisualizer';
import MermaidDiagram from './components/MermaidDiagram';
import { modelToMermaid, parseModelData } from './utils/mermaidUtils';

// Import JSON models from the json_models directory
import wolfchickens from './json_models/wolfchickens.json';
import wolfchickenworm from './json_models/wolfchickenworm.json';
import wormedwolves from './json_models/wormedwolves.json';
import causalLoopJson from './json_models/causal-loop-json.json';
import teamDynamics from './json_models/team_dynamics.json';
import conflictResolution from './json_models/conflict_resolution.json';
import mediationDynamics from './json_models/mediation_dynamics.json';
import communicationPathways from './json_models/communication_pathways.json';
import tensionEscalation from './json_models/tension_escalation.json';
import peaceBuilding from './json_models/peace_building.json';
import trustBuilding from './json_models/trust_building.json';
import emotionalIntelligence from './json_models/emotional_intelligence.json';
import socialSupport from './json_models/social_support.json';
import communicationQuality from './json_models/communication_quality.json';
import boundaryDynamics from './json_models/boundary_dynamics.json';
import workplaceCollaboration from './json_models/workplace_collaboration.json';
import interpersonalBoundaries from './json_models/interpersonal_boundaries.json';
import relationshipCommunication from './json_models/relationship_communication.json';
import empathicConnection from './json_models/empathic_connection.json';
import groupIdentityFormation from './json_models/group_identity_formation.json';

// Create a models object using the original file names
const jsonModels = {
  'wolfchickens.json': wolfchickens,
  'wolfchickenworm.json': wolfchickenworm,
  'wormedwolves.json': wormedwolves,
  'causal-loop-json.json': causalLoopJson,
  'team_dynamics.json': teamDynamics,
  'conflict_resolution.json': conflictResolution,
  'mediation_dynamics.json': mediationDynamics,
  'communication_pathways.json': communicationPathways,
  'tension_escalation.json': tensionEscalation,
  'peace_building.json': peaceBuilding,
  'trust_building.json': trustBuilding,
  'emotional_intelligence.json': emotionalIntelligence,
  'social_support.json': socialSupport,
  'communication_quality.json': communicationQuality,
  'boundary_dynamics.json': boundaryDynamics,
  'workplace_collaboration.json': workplaceCollaboration,
  'interpersonal_boundaries.json': interpersonalBoundaries,
  'relationship_communication.json': relationshipCommunication,
  'empathic_connection.json': empathicConnection,
  'group_identity_formation.json': groupIdentityFormation
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
    return modelToMermaid(parsedModel, { direction: 'TB', nodeStyle: 'circle', simplified: true });
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
  
  // Dynamically determine grid columns based on width
  const getGridColumns = () => {
    if (sidebarWidth < 30) return 1;
    if (sidebarWidth < 50) return 2;
    if (sidebarWidth < 65) return 3;
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
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [notes, setNotes] = useState({});
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [activeNoteOption, setActiveNoteOption] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [animatingNotes, setAnimatingNotes] = useState(false);
  const [flingTargets, setFlingTargets] = useState([]);
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

  // Filter out hidden options
  const visibleOptions = options.filter(option => !hiddenOptions.includes(option.id));

  const CARD_HEIGHT = 200; // Increased card height (3x)
  const CARD_SPACING = 40; // Space between cards
  const TOTAL_ITEM_HEIGHT = CARD_HEIGHT + CARD_SPACING;
  const VISIBLE_ITEMS = 4; // Number of fully visible items
  
  const handleOptionClick = (option) => {
    setSelectedOption(option.id === selectedOption ? null : option.id);
    console.log(`Selected option: ${option.label} - ${option.description}`);
  };

  // Handle removing an option
  const handleRemoveOption = (optionId) => {
    setHiddenOptions([...hiddenOptions, optionId]);
    
    // If the removed option was selected, clear selection
    if (optionId === selectedOption) {
      setSelectedOption(null);
    }
    
    // Adjust scroll position to account for the removed item
    // This ensures smooth transition when an item is removed
    const removedIndex = options.findIndex(opt => opt.id === optionId);
    const scrollAdjustment = Math.abs(scrollPosition) % (options.length * TOTAL_ITEM_HEIGHT);
    const currentVisibleIndex = Math.floor(scrollAdjustment / TOTAL_ITEM_HEIGHT);
    
    if (removedIndex <= currentVisibleIndex) {
      setScrollPosition(scrollPosition + TOTAL_ITEM_HEIGHT);
    }
  };

  // Handle edit button click to add a note
  const handleEditClick = (optionId) => {
    setActiveNoteOption(optionId);
    setNoteText(notes[optionId] || '');
    setNoteDialogOpen(true);
  };

  // Save note text
  const saveNote = () => {
    if (activeNoteOption && noteText.trim()) {
      setNotes({...notes, [activeNoteOption]: noteText});
    }
    closeNoteDialog();
  };

  // Close note dialog
  const closeNoteDialog = () => {
    setNoteDialogOpen(false);
    setActiveNoteOption(null);
    setNoteText('');
  };

  // Function to restore all hidden options
  const restoreAllOptions = () => {
    setHiddenOptions([]);
  };

  const handleWheel = (e) => {
    if (wheelRef.current) {
      e.preventDefault();
      const newPosition = scrollPosition + e.deltaY;
      
      // Calculate total scroll height for all items
      const totalHeight = visibleOptions.length * TOTAL_ITEM_HEIGHT;
      
      if (totalHeight === 0) return; // No visible options
      
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
    if (length === 0) return -1; // Handle empty array case
    return ((index % length) + length) % length;
  };
  
  // Handle compose button click
  const handleComposeClick = () => {
    // Find all visible options with notes
    const visibleIndices = [];
    const targets = [];
    
    // Calculate which items are currently visible
    const scrollAdjustment = Math.abs(scrollPosition) % (visibleOptions.length * TOTAL_ITEM_HEIGHT);
    const currentVisibleIndex = Math.floor(scrollAdjustment / TOTAL_ITEM_HEIGHT);
    
    // Find visible items with notes
    for (let i = 0; i < VISIBLE_ITEMS; i++) {
      const index = getCyclicIndex(currentVisibleIndex + i, visibleOptions.length);
      if (index !== -1) {
        const option = visibleOptions[index];
        if (notes[option.id]) {
          visibleIndices.push(index);
          targets.push(option.id);
        }
      }
    }
    
    if (targets.length > 0) {
      setFlingTargets(targets);
      setAnimatingNotes(true);
      
      // Clear the notes after animation completes
      setTimeout(() => {
        const updatedNotes = {...notes};
        targets.forEach(id => {
          delete updatedNotes[id];
        });
        setNotes(updatedNotes);
        setAnimatingNotes(false);
        setFlingTargets([]);
      }, 600); // Animation duration + small buffer
    }
  };
  
  return (
    <div className="h-full relative overflow-hidden" onWheel={handleWheel}>
      {/* Note input dialog */}
      {noteDialogOpen && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs w-full">
            <h4 className="text-sm font-medium mb-2">Add note</h4>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value.slice(0, 200))}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              placeholder="Enter note (max 200 characters)"
              rows={3}
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-3">
              <div className="text-xs text-gray-500">{noteText.length}/200</div>
              <div className="flex space-x-2">
                <button 
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                  onClick={closeNoteDialog}
                >
                  Cancel
                </button>
                <button 
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  onClick={saveNote}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
      
      {/* Restore button - only visible when there are hidden options */}
      {hiddenOptions.length > 0 && (
        <div 
          className="absolute top-4 right-4 z-20 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs cursor-pointer hover:bg-blue-200"
          onClick={restoreAllOptions}
        >
          Restore All ({hiddenOptions.length})
        </div>
      )}
      
      {/* Compose button - moved to bottom left */}
      {Object.keys(notes).length > 0 && (
        <div 
          className="absolute bottom-4 left-4 z-20 px-2 py-1 bg-green-600 text-white rounded-md text-xs cursor-pointer hover:bg-green-700"
          onClick={handleComposeClick}
        >
          Compose {Object.keys(notes).length}
        </div>
      )}
      
      {/* Items container with cyclic scrolling */}
      <div 
        ref={wheelRef}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        {visibleOptions.length === 0 ? (
          <div className="bg-white p-4 rounded-md shadow-md text-center">
            <p className="text-gray-600 mb-2">All items hidden</p>
            <button 
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              onClick={restoreAllOptions}
            >
              Restore All
            </button>
          </div>
        ) : (
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
              const actualIndex = getCyclicIndex(virtualIndex, visibleOptions.length);
              if (actualIndex === -1) return null; // If no visible options
              
              const option = visibleOptions[actualIndex];
              const hasNote = notes[option.id] !== undefined;
              const isAnimating = animatingNotes && flingTargets.includes(option.id);
              
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
              
              // Animation styles for flinging to center
              const animationStyle = isAnimating ? {
                transform: 'translateX(100vw) scale(0.8)',
                opacity: 0,
                transition: 'all 4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              } : {};
              
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
                    ...animationStyle
                  }}
                  onClick={() => isInView && handleOptionClick(option)}
                  onMouseEnter={() => isInView && setHoverOption(option.id)}
                  onMouseLeave={() => isInView && setHoverOption(null)}
                  title={option.description}
                >
                  <div className="flex flex-col w-full h-full relative">
                    {/* Remove (X) button in top left corner */}
                    <div 
                      className={`absolute top-0 left-0 w-6 h-6 rounded-full flex items-center justify-center
                      ${isSelected ? 'bg-white bg-opacity-20' : 'bg-gray-100'} hover:bg-red-200 z-10`}
                      style={{ top: '-3px', left: '-3px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(option.id);
                      }}
                    >
                      <svg 
                        className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-gray-600'} hover:text-red-600`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    
                    <div className={`flex items-center justify-center h-12 w-32 rounded-full
                      ${isSelected ? 'bg-white bg-opacity-20' : 'bg-blue-50'}
                    `}>
                      <span className={`font-medium text-lg ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                        {option.label}
                      </span>
                    </div>
                    
                    {/* Note preview area */}
                    {hasNote && (
                      <div className="p-2 mt-2 text-xs text-gray-600 italic bg-green-50 rounded max-h-24 overflow-hidden">
                        {notes[option.id]}
                      </div>
                    )}
                    
                    <div className="flex-1"></div>
                    
                    {/* Edit icon in bottom right corner - moved closer to corner */}
                    <div 
                      className={`absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center
                      ${isSelected ? 'bg-white bg-opacity-20' : 'bg-gray-100'} 
                      hover:bg-blue-200
                      ${hasNote ? 'ring-2 ring-green-400 shadow-lg shadow-green-200' : ''}`}
                      style={{ bottom: '-3px', right: '-3px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(option.id);
                      }}
                    >
                      <svg 
                        className={`w-3 h-3 ${isSelected ? 'text-white' : hasNote ? 'text-green-600' : 'text-blue-600'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const UnifiedInterface = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalModel, setModalModel] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  
  // Add state for model library overlay
  const [libraryOpen, setLibraryOpen] = useState(false);
  
  // Add state for feedback modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackModel, setFeedbackModel] = useState(null);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  
  // Add a new state for the view mode 
  const [viewMode, setViewMode] = useState('detail'); // Options: 'detail', 'composition', 'overview'
  
  // Add state for sidebar width (1-4 models wide)
  const [sidebarWidth, setSidebarWidth] = useState(25); // Width percentage (25% = detail, 40% = composition, 75% = overview)
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle view mode changes
  const handleViewModeChange = (mode) => {
    console.log(`View mode changed to: ${mode}`);
    setViewMode(mode);
    
    // Smoothly adjust sidebar width based on view mode
    if (mode === 'detail') {
      setSidebarWidth(25);
    } else if (mode === 'composition') {
      setSidebarWidth(40);
    } else if (mode === 'overview') {
      setSidebarWidth(75);
    }
  };
  
  // Update view mode based on sidebar width
  const updateViewModeFromWidth = (width) => {
    if (width < 32) {
      setViewMode('detail');
    } else if (width < 55) {
      setViewMode('composition');
    } else {
      setViewMode('overview');
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
    
    // Limit minimum and maximum width
    const limitedWidth = Math.max(15, Math.min(85, newWidth));
    setSidebarWidth(limitedWidth);
    updateViewModeFromWidth(limitedWidth);
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
  
  // Determine if Loopy should be visible
  const isLoopyVisible = sidebarWidth < 50;
  
  // Dynamically determine grid columns based on width
  const getGridColumns = () => {
    if (sidebarWidth < 30) return 1;
    if (sidebarWidth < 50) return 2;
    if (sidebarWidth < 65) return 3;
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
    setSelectedModel(Object.keys(jsonModels).find(key => jsonModels[key] === feedbackModel));
    setFeedbackModalOpen(false);
  };
  
  // Format model name by removing .json extension and adding spaces
  const formatModelName = (filename) => {
    return filename
      .replace('.json', '')
      .split(/(?=[A-Z])|[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
    const filteredModels = Object.keys(jsonModels).filter(filename => {
      const displayName = formatModelName(filename).toLowerCase();
      const description = getModelDescription(filename).toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return displayName.includes(search) || description.includes(search);
    });
    
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
        
        {/* Search Bar */}
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
        
        <div className="flex-1 overflow-y-auto pr-2">
          {filteredModels.length > 0 ? (
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
                      onClick={(e) => handleStealModel(e, model, displayName)}
                      className="mt-2 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Steal
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
        {/* Left sidebar with wheel (only visible in detail view) */}
        {sidebarWidth < 32 && (
          <aside className="w-56 transition-all duration-300 ease-in-out">
            <SideWheel />
          </aside>
        )}
        
        {/* Main visualization area with Loopy or placeholder */}
        <main 
          className="transition-all duration-300 ease-in-out overflow-auto p-6 flex-1"
          style={{ width: sidebarWidth < 32 ? `calc(100% - ${sidebarWidth}% - 56px)` : `calc(100% - ${sidebarWidth}%)` }}
        >
          <div className="bg-white rounded-lg shadow-md p-6 h-full relative">
            {isLoopyVisible ? (
              <>
                {/* Visual indicator connecting the side wheel to Loopy interface */}
                {sidebarWidth < 32 && (
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
                <h3 className="text-lg font-medium text-gray-700 mb-2">Loopy Visualizer Hidden</h3>
                <p className="text-gray-500 max-w-xs">
                  The visualizer is hidden in this expanded view mode. Return to detail view to interact with the Loopy model.
                </p>
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
          className="border-l border-gray-200 p-4 overflow-y-auto transition-all duration-300 ease-in-out"
          style={{ width: `${sidebarWidth}%` }}
        >
          <ModelSidebar />
        </aside>
      </div>
      
      {/* Replace footer with view mode slider */}
      <div className="bg-white shadow-inner py-4 flex justify-center items-center">
        <div className="w-1/3 flex flex-col items-center">
          <div className="flex justify-between w-full mb-2">
            <span className={`text-xs font-medium transition-colors duration-200 ${sidebarWidth < 32 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>Detail View</span>
            <span className={`text-xs font-medium transition-colors duration-200 ${sidebarWidth >= 32 && sidebarWidth < 55 ? 'text-purple-600 font-semibold' : 'text-gray-500'}`}>Composition</span>
            <span className={`text-xs font-medium transition-colors duration-200 ${sidebarWidth >= 55 ? 'text-pink-600 font-semibold' : 'text-gray-500'}`}>Overview</span>
          </div>
          <div className="relative w-full h-8">
            {/* Background track */}
            <div 
              className="absolute left-0 right-0 top-1/2 h-1 -mt-0.5 rounded-full"
              style={{
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)'
              }}
            ></div>
            
            {/* Slider track indicator */}
            <div 
              className="absolute left-0 top-1/2 h-3 -mt-1.5 bg-white rounded-full shadow border border-gray-200 transition-all"
              style={{
                left: `calc(${((sidebarWidth - 15) / 70) * 100}% - 6px)`,
                width: '12px'
              }}
            ></div>
            
            {/* Slider button markers */}
            <div className="flex justify-between w-full absolute top-1/2 -mt-3 z-0">
              <button 
                className={`w-6 h-6 rounded-full shadow transition-all duration-300 flex items-center justify-center 
                  ${sidebarWidth < 32 ? 'bg-blue-500 ring-4 ring-blue-200 scale-110' : 'bg-white border border-gray-300'}`}
                onClick={() => handleViewModeChange('detail')}
              >
                {sidebarWidth < 32 && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </button>
              <button 
                className={`w-6 h-6 rounded-full shadow transition-all duration-300 flex items-center justify-center 
                  ${sidebarWidth >= 32 && sidebarWidth < 55 ? 'bg-purple-500 ring-4 ring-purple-200 scale-110' : 'bg-white border border-gray-300'}`}
                onClick={() => handleViewModeChange('composition')}
              >
                {sidebarWidth >= 32 && sidebarWidth < 55 && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </button>
              <button 
                className={`w-6 h-6 rounded-full shadow transition-all duration-300 flex items-center justify-center 
                  ${sidebarWidth >= 55 ? 'bg-pink-500 ring-4 ring-pink-200 scale-110' : 'bg-white border border-gray-300'}`}
                onClick={() => handleViewModeChange('overview')}
              >
                {sidebarWidth >= 55 && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </button>
            </div>
            
            {/* Continuous range input for direct sidebar width control */}
            <input 
              type="range" 
              min="15" 
              max="85" 
              step="1"
              value={sidebarWidth}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setSidebarWidth(val);
                updateViewModeFromWidth(val);
              }}
              className="appearance-none absolute inset-0 w-full h-2 mt-3 opacity-0 cursor-pointer z-10"
            />
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