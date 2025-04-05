import React, { useState, useEffect } from 'react';
import LoopyVisualizer from './components/LoopyVisualizer';
import { Link } from 'react-router-dom';
import { jsonModels, formatModelName, getModelNames } from './utils/jsonModelLoader';

// Create a models object using the original file names
// The jsonModels object is now imported from the loader utility

// Helper function to format model names for display
// This function is now imported from the loader utility

const LoopyDemo = () => {
  // State for the selected model
  const [selectedModel, setSelectedModel] = useState('wolfchickens.json');
  const [modelNames, setModelNames] = useState([]);
  
  useEffect(() => {
    // Load model names using the utility function
    setModelNames(getModelNames());
    // Set default selected model if needed
    if (!selectedModel && modelNames.length > 0) {
      setSelectedModel(modelNames[0]);
    }
  }, []);

  // Function to handle model selection
  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Loopy Visualizer Demo</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="model-select">
          Select a Model
        </label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={handleModelChange}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          {modelNames.map((modelName) => (
            <option key={modelName} value={modelName}>
              {formatModelName(modelName)}
            </option>
          ))}
        </select>
      </div>

      {selectedModel && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">{formatModelName(selectedModel)}</h2>
          <LoopyVisualizer model={jsonModels[selectedModel]} />
        </div>
      )}

      <div className="mt-4">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default LoopyDemo; 