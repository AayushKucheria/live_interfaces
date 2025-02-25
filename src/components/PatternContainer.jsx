import React from 'react';

const PatternContainer = ({ pattern, metadata, example }) => {
  // Ensure we have components to render
  const ExampleComponent = example;
  
  return (
    <div className="pattern-container p-6 border rounded-lg mb-6 bg-white shadow-sm">
      <div className="pattern-header mb-4">
        <h3 className="text-lg font-medium">{metadata?.title || "Unknown Pattern"}</h3>
        <p className="text-slate-600 text-sm">{metadata?.description || "No description available"}</p>
      </div>
      <div className="pattern-demo bg-slate-50 p-4 rounded-lg">
        {ExampleComponent ? <ExampleComponent /> : <p>Example not available</p>}
      </div>
    </div>
  );
};

export default PatternContainer; 