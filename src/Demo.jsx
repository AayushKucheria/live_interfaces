import React, { useState, useEffect } from 'react';
import ModelVisualizer from './components/ModelVisualizer';

// Example model data
const sampleModels = {
  basicModel: {
    objects: [
      { id: "wolves", name: "wolves" },
      { id: "chickens", name: "chickens" }
    ],
    morphisms: [
      { 
        type: "Negative", 
        from: "wolves", 
        to: "chickens"
      },
      { 
        type: "Hom", 
        from: "chickens", 
        to: "wolves"
      }
    ],
    theory: "causal-loop"
  },
  
  fullModel: {
    objects: [
      { id: "wolves", name: "wolves" },
      { id: "chickens", name: "chickens" },
      { id: "worms", name: "worms" }
    ],
    morphisms: [
      { 
        type: "Negative", 
        from: "wolves", 
        to: "chickens"
      },
      { 
        type: "Hom", 
        from: "chickens", 
        to: "wolves"
      },
      { 
        type: "Negative", 
        from: "chickens", 
        to: "worms"
      },
      { 
        type: "Hom", 
        from: "worms", 
        to: "chickens"
      },
      { 
        type: "Negative", 
        from: "worms", 
        to: "wolves"
      }
    ],
    theory: "causal-loop"
  },
  
  // You can also use CatCoLab JSON directly
  catcolabExample: {
    name: "",
    notebook: {
      cells: [
        {
          tag: "formal",
          id: "01959aaf-9f97-741c-b80c-950548aa2194",
          content: {
            tag: "object",
            id: "01959aaf-9f97-741c-b80c-93ad3f4425e2",
            name: "wolves",
            obType: {
              tag: "Basic",
              content: "Object"
            }
          }
        },
        {
          tag: "formal",
          id: "01959aaf-e453-77aa-8fda-a552e9bcc5cd",
          content: {
            tag: "object",
            id: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6",
            name: "chickens",
            obType: {
              tag: "Basic",
              content: "Object"
            }
          }
        },
        {
          tag: "formal",
          id: "01959ab0-8d75-72c5-9b82-6fecc669b92f",
          content: {
            tag: "morphism",
            id: "01959ab0-8d75-72c5-9b82-690ecf134770",
            name: "",
            morType: {
              tag: "Basic",
              content: "Negative"
            },
            dom: {
              tag: "Basic",
              content: "01959aaf-9f97-741c-b80c-93ad3f4425e2"
            },
            cod: {
              tag: "Basic",
              content: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6"
            }
          }
        },
        {
          tag: "formal",
          id: "01959ab0-dcac-7588-b156-3296c765117e",
          content: {
            tag: "morphism",
            id: "01959ab0-dcac-7588-b156-2fb7ac287286",
            name: "",
            morType: {
              tag: "Hom",
              content: {
                tag: "Basic",
                content: "Object"
              }
            },
            dom: {
              tag: "Basic",
              content: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6"
            },
            cod: {
              tag: "Basic",
              content: "01959aaf-9f97-741c-b80c-93ad3f4425e2"
            }
          }
        }
      ]
    },
    theory: "causal-loop",
    type: "model"
  }
};

const Demo = () => {
  const [selectedModel, setSelectedModel] = useState('basicModel');
  
  const renderModelSelector = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <button 
        onClick={() => setSelectedModel('basicModel')}
        className={`px-4 py-2 rounded ${selectedModel === 'basicModel' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        Basic Model
      </button>
      <button 
        onClick={() => setSelectedModel('fullModel')}
        className={`px-4 py-2 rounded ${selectedModel === 'fullModel' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        Full Model
      </button>
      <button 
        onClick={() => setSelectedModel('catcolabExample')}
        className={`px-4 py-2 rounded ${selectedModel === 'catcolabExample' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      >
        CatCoLab Format
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">CatCoLab Model Visualizer</h1>
      
      {renderModelSelector()}
      
      <div className="bg-blue-50 p-6 rounded-lg">
        <ModelVisualizer 
          model={sampleModels[selectedModel]} 
          title="Model Visualization"
        />
      </div>
    </div>
  );
};

export default Demo;