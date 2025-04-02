import React, { useState, useMemo, memo } from 'react';
import LoopyVisualizer from './components/LoopyVisualizer';
import MermaidDiagram from './components/MermaidDiagram';
import { modelToMermaid, parseModelData } from './utils/mermaidUtils';

// Import JSON models from the json_models directory
import wolfchickens from './json_models/wolfchickens.json';
import wolfchickenworm from './json_models/wolfchickenworm.json';
import wormedwolves from './json_models/wormedwolves.json';

// Create a models object using the original file names
const jsonModels = {
  'wolfchickens.json': wolfchickens,
  'wolfchickenworm.json': wolfchickenworm,
  'wormedwolves.json': wormedwolves
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

// Memoized MermaidPreview component to avoid unnecessary re-renders
const MermaidPreview = memo(({ model, isSelected, onExpand }) => {
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
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Prevent selection in the parent
          onExpand();
        }}
        className="mt-2 w-full text-xs text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 rounded px-2 py-1"
      >
        Expand View
      </button>
    </div>
  );
});

const UnifiedInterface = () => {
  const [selectedModel, setSelectedModel] = useState('wolfchickens.json');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalModel, setModalModel] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  
  // Handler to open modal with a specific model
  const handleExpandModel = (model, title) => {
    setModalModel(model);
    setModalTitle(title);
    setModalOpen(true);
  };
  
  // Sidebar component for model selection with Mermaid visualizations
  const ModelSidebar = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full overflow-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Available Models</h3>
        <div className="space-y-6">
          {Object.keys(jsonModels).map((filename) => {
            const model = jsonModels[filename];
            const isSelected = selectedModel === filename;
            
            return (
              <div 
                key={filename}
                onClick={() => setSelectedModel(filename)}
                className={`rounded-md cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-blue-500' 
                    : 'hover:bg-blue-50'
                }`}
              >
                <div className="p-3 border-b border-gray-200">
                  <p className="font-medium">{filename}</p>
                </div>
                <MermaidPreview 
                  model={model} 
                  isSelected={isSelected} 
                  onExpand={() => handleExpandModel(model, filename)}
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
              model={jsonModels[selectedModel]} 
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
    </div>
  );
};

export default UnifiedInterface; 