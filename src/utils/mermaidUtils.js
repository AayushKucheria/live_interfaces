/**
 * Utility functions for converting JSON models to Mermaid diagrams
 */

/**
 * Converts a causal model JSON to mermaid flowchart syntax
 * @param {Object} model The causal model with objects and morphisms
 * @returns {string} Mermaid syntax for the causal model
 */
export function causalModelToMermaid(model) {
  if (!model || !model.objects || !model.morphisms) {
    return 'graph TD\n  missing[Missing model data]';
  }

  const { objects, morphisms } = model;
  
  // Start with flowchart definition - use TB (top to bottom) for clarity
  let mermaidCode = 'graph TB\n';
  
  // Add nodes
  objects.forEach(obj => {
    // Create node with ID and label - simplified styling
    const safeId = sanitizeId(obj.id);
    mermaidCode += `  ${safeId}["${obj.name}"]\n`;
  });
  
  // Add relationships with simple syntax
  morphisms.forEach(morphism => {
    const fromId = sanitizeId(findObjectById(objects, morphism.from)?.id || morphism.from);
    const toId = sanitizeId(findObjectById(objects, morphism.to)?.id || morphism.to);
    
    if (morphism.type === 'Negative') {
      // Use simple dashed line for negative (without spaces)
      mermaidCode += `  ${fromId} -.->|negative| ${toId}\n`;
    } else if (morphism.type === 'Hom') {
      // Use solid line with simple label for positive
      mermaidCode += `  ${fromId} -->|positive| ${toId}\n`;
    } else {
      // Default arrow
      mermaidCode += `  ${fromId} --> ${toId}\n`;
    }
  });
  
  return mermaidCode;
}

/**
 * Converts a more complex ecosystem model to mermaid diagram
 * @param {Object} model The ecosystem model
 * @returns {string} Mermaid syntax for the ecosystem model
 */
export function ecosystemModelToMermaid(model) {
  if (!model || !model.objects || !model.morphisms) {
    return 'graph TD\n  missing[Missing model data]';
  }
  
  const { objects, morphisms } = model;
  
  // Use a top to bottom graph for better layout
  let mermaidCode = 'graph TB\n';
  
  // Add nodes - simplified without colors
  objects.forEach(obj => {
    const safeId = sanitizeId(obj.id);
    mermaidCode += `  ${safeId}["${obj.name}"]\n`;
  });
  
  // Add relationships with very simple styling
  morphisms.forEach(morphism => {
    const fromId = sanitizeId(findObjectById(objects, morphism.from)?.id || morphism.from);
    const toId = sanitizeId(findObjectById(objects, morphism.to)?.id || morphism.to);
    
    if (morphism.type === 'Negative') {
      // Very simple dashed line for negative (no spaces)
      mermaidCode += `  ${fromId} -.->|negative| ${toId}\n`;
    } else if (morphism.type === 'Hom') {
      // Very simple solid line with label for positive
      mermaidCode += `  ${fromId} -->|positive| ${toId}\n`;
    } else {
      // Default connection
      mermaidCode += `  ${fromId} --> ${toId}\n`;
    }
  });
  
  // Add a super simple legend if theory is available
  if (model.theory) {
    mermaidCode += `  subgraph Legend["${model.theory.charAt(0).toUpperCase() + model.theory.slice(1)} Theory"]\n`;
    mermaidCode += `    positive["Positive Effect"]\n`;
    mermaidCode += `    negative["Negative Effect"]\n`;
    mermaidCode += `  end\n`;
  }
  
  return mermaidCode;
}

/**
 * Main function to convert any model type to mermaid syntax
 * @param {Object} model The model to convert
 * @param {Object} options Visualization options
 * @returns {string} Mermaid diagram code
 */
export function modelToMermaid(model, options = {}) {
  if (!model) {
    return 'graph TD\n  missing[Missing model data]';
  }
  
  // Determine model type and use appropriate conversion
  if (model.type === 'ecosystem') {
    return ecosystemModelToMermaid(model);
  } else if (model.type === 'causal') {
    return causalModelToMermaid(model);
  }
  
  // Default to causal model if type not specified
  return causalModelToMermaid(model);
}

/**
 * Parse and normalize model data from various formats
 * @param {Object} data The raw model data
 * @returns {Object} Normalized model data
 */
export function parseModelData(data) {
  if (!data) return { objects: [], morphisms: [] };
  
  // If data is already in the expected format with objects and morphisms
  if (data.objects && data.morphisms) {
    return {
      ...data,
      objects: data.objects.map(obj => ({
        id: obj.id || obj.name?.replace(/\s+/g, '_').toLowerCase() || `obj_${Math.random().toString(36).substr(2, 9)}`,
        name: obj.name || obj.id || 'Unnamed',
        ...obj
      })),
      morphisms: data.morphisms.map(m => ({
        id: m.id || `${m.from}_to_${m.to}`,
        type: m.type || 'Hom',
        ...m
      }))
    };
  }
  
  // Handle CatCoLab notebook format (json_models format)
  if (data.notebook && data.notebook.cells) {
    const objects = [];
    const morphisms = [];
    
    // Process CatCoLab notebook cells
    data.notebook.cells.forEach(cell => {
      if (cell.tag === 'formal' && cell.content) {
        // Extract objects
        if (cell.content.tag === 'object') {
          objects.push({
            id: sanitizeId(cell.content.id),
            name: cell.content.name || 'Unnamed',
            type: cell.content.obType?.content || 'Object'
          });
        }
        // Extract morphisms
        else if (cell.content.tag === 'morphism') {
          const morphismType = 
            cell.content.morType?.tag === 'Basic' && cell.content.morType.content === 'Negative' 
              ? 'Negative' 
              : 'Hom';
          
          const domId = cell.content.dom?.content;
          const codId = cell.content.cod?.content;
          
          if (domId && codId) {
            morphisms.push({
              id: sanitizeId(cell.content.id),
              from: sanitizeId(domId),
              to: sanitizeId(codId),
              type: morphismType
            });
          }
        }
      }
    });
    
    return {
      type: data.type || 'model',
      theory: data.theory || null,
      objects,
      morphisms
    };
  }
  
  // Handle CatCoLab format (if different)
  if (data.nodes && data.edges) {
    return {
      type: data.type || 'causal',
      theory: data.theory || null,
      objects: data.nodes.map(node => ({
        id: sanitizeId(node.id || `node_${Math.random().toString(36).substr(2, 9)}`),
        name: node.label || node.name || node.id || 'Unnamed',
      })),
      morphisms: data.edges.map(edge => ({
        id: sanitizeId(edge.id || `${edge.source}_to_${edge.target}`),
        from: sanitizeId(edge.source || edge.from),
        to: sanitizeId(edge.target || edge.to),
        type: edge.relationship === 'negative' ? 'Negative' : 'Hom'
      }))
    };
  }
  
  // Fallback for unknown formats
  console.warn('Unknown model format, attempting to parse');
  return {
    type: 'causal',
    theory: null,
    objects: Object.keys(data).filter(key => typeof data[key] === 'object').map(key => ({
      id: sanitizeId(key),
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
    })),
    morphisms: []
  };
}

/**
 * Sanitizes an ID for use in mermaid diagrams
 * @param {string} id The ID to sanitize
 * @returns {string} Sanitized ID safe for mermaid
 */
function sanitizeId(id) {
  if (!id) return 'unknown';
  
  // Replace any special characters that might conflict with mermaid syntax
  return String(id).replace(/[^\w]/g, '_');
}

/**
 * Finds an object by its ID in an array of objects
 * @param {string} objects Array of objects to search
 * @param {string} id ID to search for
 * @returns {Object|null} The found object or null
 */
function findObjectById(objects, id) {
  return objects.find(obj => obj.id === id) || null;
} 