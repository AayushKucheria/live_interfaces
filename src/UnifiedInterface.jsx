import React, { useState, useMemo, memo } from 'react';
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
  'boundary_dynamics.json': boundaryDynamics
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

const UnifiedInterface = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalModel, setModalModel] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  
  // Add state for feedback modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackModel, setFeedbackModel] = useState(null);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  
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
      'boundary_dynamics.json': 'A model showing boundary-setting in relationships.'
    };
    
    return descriptions[filename] || 'A causal loop diagram model.';
  };
  
  // Sidebar component for model selection with Mermaid visualizations
  const ModelSidebar = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col overflow-hidden">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Available Models</h3>
        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          {Object.keys(jsonModels).map((filename) => {
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
          })}
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
    </div>
  );
};

export default UnifiedInterface; 