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
    return <div className="text-red-500">No model data provided</div>;
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
    fontFamily: 'inherit',
    flowchart: {
      curve: 'linear',
      htmlLabels: true
    }
  };
  
  return (
    <div className="model-visualizer">
      {title && (
        <h3 className="text-sm font-medium text-slate-700 mb-3">{title}</h3>
      )}
      <div className="relative border border-gray-200 rounded-lg p-4 bg-white">
        <MermaidDiagram chart={mermaidCode} config={mermaidConfig} />
      </div>
      {parsedModel.theory && (
        <div className="mt-2 text-xs text-slate-500">
          <p>This visualization represents a {parsedModel.theory} model.</p>
        </div>
      )}
    </div>
  );
};

export default ModelVisualizer; 