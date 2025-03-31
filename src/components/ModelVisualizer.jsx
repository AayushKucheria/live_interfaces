import React from 'react';
import MermaidDiagram from './MermaidDiagram';
import { modelToMermaid, parseModelData } from '../utils/mermaidUtils';

/**
 * Component to visualize JSON models using mermaid diagrams
 * @param {Object} props Component props
 * @param {Object} props.model The model data with objects and morphisms
 * @param {string} props.title Optional title for the visualization
 * @param {Object} props.options Optional rendering options
 */
const ModelVisualizer = ({ model, title, options = {} }) => {
  if (!model) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-center">
          <p className="mb-2 text-xl">No model selected</p>
          <p className="text-sm">Please select a model from the sidebar</p>
        </div>
      </div>
    );
  }

  // Parse model data if in CatCoLab format
  const parsedModel = parseModelData(model);
  
  // Use standard visualization options
  const visualizationOptions = {
    // Default options for all visualizations
    direction: 'TB',
    nodeStyle: 'box',
    includeLabels: true,
    includeLegend: true,
    positiveLabel: 'positive',
    negativeLabel: 'negative',
    
    // Allow custom options to override defaults
    ...options
  };
  
  // Generate mermaid code
  const mermaidCode = modelToMermaid(parsedModel, visualizationOptions);
  
  // Mermaid configuration
  const mermaidConfig = {
    theme: options.theme || 'neutral',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    flowchart: {
      curve: 'basis',
      htmlLabels: true,
      padding: 15
    }
  };
  
  return (
    <div className="model-visualizer h-full flex flex-col">
      {title && (
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        </div>
      )}
      
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <div className="relative max-w-full bg-white p-6 rounded-lg shadow-inner border border-gray-100">
          <MermaidDiagram chart={mermaidCode} config={mermaidConfig} />
        </div>
      </div>
      
      {parsedModel.theory && (
        <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
          <p>This visualization represents a {parsedModel.theory} model.</p>
          <div className="text-xs font-medium text-gray-400">
            {Object.keys(parsedModel.objects || {}).length} objects • 
            {Object.keys(parsedModel.morphisms || {}).length} morphisms
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelVisualizer; 