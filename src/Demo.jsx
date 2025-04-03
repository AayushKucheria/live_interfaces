import React, { useState, useEffect } from 'react';
import ModelVisualizer from './components/ModelVisualizer';
import { Link } from 'react-router-dom';

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

// Helper function to format model names for display
const formatModelName = (filename) => {
  return filename
    .replace('.json', '')
    .split(/(?=[A-Z])|[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const Demo = () => {
  const [selectedModel, setSelectedModel] = useState('wolfchickens.json');
  
  // Sidebar component for model selection
  const ModelSidebar = () => (
    <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Available Models</h3>
      <div className="space-y-2 flex-1 overflow-y-auto pr-2">
        {Object.keys(jsonModels).map((filename) => (
          <div 
            key={filename}
            onClick={() => setSelectedModel(filename)}
            className={`p-3 rounded-md cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
              selectedModel === filename 
                ? 'bg-blue-100 border-l-4 border-blue-500' 
                : 'bg-gray-50'
            } mb-2`}
          >
            <p className="font-medium">{formatModelName(filename)}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link 
          to="/loopy" 
          className="block w-full py-2 px-4 bg-blue-500 text-white rounded text-center hover:bg-blue-600 transition-colors"
        >
          Try Loopy Visualizer
        </Link>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-3">
        <h1 className="text-2xl font-bold text-gray-800">CatCoLab Model Visualizer</h1>
      </header>
      
      {/* Main content with sidebar layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main visualization area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <ModelVisualizer 
              model={jsonModels[selectedModel]} 
              title={formatModelName(selectedModel)}
            />
          </div>
        </main>
        
        {/* Right sidebar */}
        <aside className="w-72 border-l border-gray-200 p-4 overflow-hidden">
          <ModelSidebar />
        </aside>
      </div>
    </div>
  );
};

export default Demo;