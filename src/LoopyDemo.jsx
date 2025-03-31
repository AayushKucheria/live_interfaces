import React, { useState } from 'react';
import LoopyVisualizer from './components/LoopyVisualizer';
import { Link } from 'react-router-dom';

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

const LoopyDemo = () => {
  const [selectedModel, setSelectedModel] = useState('wolfchickens.json');
  
  // Sidebar component for model selection
  const ModelSidebar = () => (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Convert CatCoLab Model</h3>
      <p className="text-sm text-gray-600 mb-4">
        Select a model to convert to Loopy format. This is experimental and may not represent all relations perfectly.
      </p>
      <div className="space-y-2">
        {Object.keys(jsonModels).map((filename) => (
          <div 
            key={filename}
            onClick={() => setSelectedModel(filename)}
            className={`p-3 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
              selectedModel === filename 
                ? 'bg-blue-100 border-l-4 border-blue-500' 
                : 'bg-gray-50'
            }`}
          >
            <p className="font-medium">{filename}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">CatCoLab Loopy Visualizer</h1>
        <Link 
          to="/" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Back to Mermaid View
        </Link>
      </header>
      
      {/* Main content with sidebar layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main visualization area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <LoopyVisualizer 
              model={jsonModels[selectedModel]} 
              title="Loopy Interactive Model" 
            />
          </div>
        </main>
        
        {/* Right sidebar */}
        <aside className="w-64 border-l border-gray-200 p-4 overflow-y-auto">
          <ModelSidebar />
        </aside>
      </div>
      
      {/* Footer with info about Loopy */}
      <footer className="bg-white shadow-inner px-6 py-3 text-sm text-gray-600">
        <p>
          Loopy is an interactive tool for creating causal loop diagrams. 
          You can create nodes and arrows to model system dynamics.
        </p>
      </footer>
    </div>
  );
};

export default LoopyDemo; 