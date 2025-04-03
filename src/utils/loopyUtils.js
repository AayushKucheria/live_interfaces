/**
 * Utility functions for working with Loopy diagrams and converting from CatCoLab models
 */

/**
 * Parse a CatCoLab model into structured format
 * @param {Object} model - The CatCoLab model JSON
 * @returns {Object} Structured model data with objects and morphisms
 */
export function parseModelData(model) {
  // If model is already parsed, return it
  if (model.objects && model.morphisms) return model;
  
  const result = {
    objects: {},
    morphisms: {},
    theory: model.theory || ''
  };
  
  if (!model.notebook || !model.notebook.cells) return result;
  
  // Process each cell in the notebook
  model.notebook.cells.forEach(cell => {
    if (cell.tag !== 'formal' || !cell.content) return;
    
    // Process objects
    if (cell.content.tag === 'object') {
      result.objects[cell.content.id] = {
        id: cell.content.id,
        name: cell.content.name || 'Unnamed',
        type: cell.content.obType?.content || 'Object'
      };
    }
    
    // Process morphisms
    if (cell.content.tag === 'morphism') {
      result.morphisms[cell.content.id] = {
        id: cell.content.id,
        name: cell.content.name || '',
        type: cell.content.morType?.content === 'Negative' ? 'negative' : 'positive',
        source: cell.content.dom?.content || '',
        target: cell.content.cod?.content || ''
      };
    }
  });
  
  return result;
}

/**
 * Convert a CatCoLab model to Loopy format
 * @param {Object} model - The CatCoLab model to convert
 * @returns {Object} Loopy-compatible model data
 */
export function modelToLoopy(model) {
  const parsedModel = parseModelData(model);
  
  // Initialize Loopy model structure
  const loopyModel = {
    nodes: [],
    edges: [],
    labels: []
  };
  
  // Use more conservative positioning to avoid edge issues
  const objectCount = Object.keys(parsedModel.objects).length;
  const radius = Math.min(150, 400 / (objectCount || 1)); // Adaptive radius - smaller for more nodes
  const centerX = 500; // Loopy's canvas is 960x500, we multiply by 2 for retina
  const centerY = 350; // Centers vertically in the visible area
  
  // Add nodes (objects)
  let index = 0;
  
  for (const objId in parsedModel.objects) {
    const obj = parsedModel.objects[objId];
    
    // Calculate position in a circle with some variation
    const angle = (index / objectCount) * Math.PI * 2;
    
    // Add slight variation to avoid perfectly symmetrical layouts
    const radiusVariation = radius * (0.9 + Math.random() * 0.2);
    // Multiply coordinates by 2 for retina display
    const x = centerX + radiusVariation * Math.cos(angle) * 2;
    const y = centerY + radiusVariation * Math.sin(angle) * 2;
    
    loopyModel.nodes.push({
      id: index,
      name: obj.name || 'Node ' + (index + 1),
      x: x,
      y: y,
      // Loopy uses hue values 0-5 for its preset colors
      hue: index % 6
    });
    
    index++;
  }
  
  // Map to track object ID to node index
  const nodeIdMapping = {};
  Object.keys(parsedModel.objects).forEach((objId, i) => {
    nodeIdMapping[objId] = i;
  });
  
  // Add edges (morphisms)
  index = 0;
  for (const morphId in parsedModel.morphisms) {
    const morph = parsedModel.morphisms[morphId];
    
    // Skip if source or target not found
    if (nodeIdMapping[morph.source] === undefined || 
        nodeIdMapping[morph.target] === undefined) continue;
    
    // Determine arc based on whether there's already an edge in the opposite direction
    // This helps prevent overlapping edges
    let arc = 0;
    for (const edge of loopyModel.edges) {
      if (edge.from === nodeIdMapping[morph.target] && edge.to === nodeIdMapping[morph.source]) {
        arc = 100; // If reverse edge exists, add an arc
        break;
      }
    }
    
    // Self-loop needs an arc
    if (morph.source === morph.target) {
      arc = 200;
    }
    
    loopyModel.edges.push({
      id: index,
      from: nodeIdMapping[morph.source],
      to: nodeIdMapping[morph.target],
      arc: arc,
      strength: morph.type === 'negative' ? -1 : 1
    });
    
    index++;
  }
  
  // Add a descriptive label if there are any nodes
  if (loopyModel.nodes.length > 0) {
    loopyModel.labels.push({
      text: model.theory || 'CatCoLab Model',
      x: centerX, // Also multiplied by 2 for retina
      y: centerY + radius * 2 + 100
    });
  }
  
  return loopyModel;
}

/**
 * Function to send a model to the Loopy iframe
 * @param {Object} model - The Loopy model data
 * @param {HTMLIFrameElement} iframe - Reference to the Loopy iframe
 * @returns {boolean} - Whether the model was sent successfully
 */
export function sendModelToLoopy(model, iframe) {
  if (!iframe || !iframe.contentWindow) {
    console.error('Invalid iframe reference');
    return false;
  }
  
  try {
    // Basic validation
    if (!model || !model.nodes || !Array.isArray(model.nodes)) {
      console.error('Invalid model format - nodes array missing or not an array');
      return false;
    }
    
    // Ensure all required properties exist
    model.nodes.forEach((node, i) => {
      if (node.id === undefined) node.id = i;
      if (node.x === undefined) node.x = 250;
      if (node.y === undefined) node.y = 250;
      if (!node.name) node.name = 'Node ' + (i + 1);
      if (node.hue === undefined) node.hue = i % 6;
    });
    
    // Ensure edges have valid from/to references
    if (model.edges && Array.isArray(model.edges)) {
      const validNodeIds = new Set(model.nodes.map(n => n.id));
      model.edges = model.edges.filter(edge => {
        return validNodeIds.has(edge.from) && validNodeIds.has(edge.to);
      });
    }
    
    // Convert model to Loopy's expected format
    const loopyFormat = [
      model.nodes.map(node => [
        node.id,
        node.x,
        node.y,
        node.init || 0,
        encodeURIComponent(node.name),
        node.hue
      ]),
      model.edges.map(edge => [
        edge.from,
        edge.to,
        edge.arc || 0,
        edge.strength || 1,
        edge.rotation || 0
      ]),
      model.labels.map(label => [
        label.x,
        label.y,
        encodeURIComponent(label.text)
      ]),
      Date.now() // UID
    ];
    
    // Send via postMessage
    iframe.contentWindow.postMessage({
      action: 'import',
      data: JSON.stringify(loopyFormat)
    }, '*');
    
    return true;
  } catch (error) {
    console.error('Error sending model to Loopy:', error);
    return false;
  }
}

export default {
  parseModelData,
  modelToLoopy,
  sendModelToLoopy
}; 