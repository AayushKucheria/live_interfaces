/**
 * Converts a Loopy model to a simplified format for Claude AI
 * @param {Object} model - The model in Loopy format or CatCoLab format
 * @returns {Object} - The simplified model
 */
export const simplifyModelForAI = (model) => {
  console.log('=== simplifyModelForAI INPUT ===');
  console.log(JSON.stringify(model, null, 2));
  
  // Default empty result structure
  const emptyResult = { nodes: [], edges: [] };
  
  // If model is null or undefined, return an empty structure
  if (!model) {
    console.log('=== simplifyModelForAI OUTPUT (empty) ===');
    console.log(JSON.stringify(emptyResult, null, 2));
    return emptyResult;
  }
  
  let result = emptyResult;
  
  // Handle Loopy format
  if (model.nodes && Array.isArray(model.nodes)) {
    console.log('=== Processing Loopy format model ===');
    
    result = {
      nodes: model.nodes.map(n => ({ id: n.id.toString(), name: n.name })),
      edges: (model.edges || []).map(e => ({ 
        from: e.from.toString(), 
        to: e.to.toString(), 
        type: e.strength < 0 ? 'negative' : 'positive' 
      }))
    };
    
    console.log('=== simplifyModelForAI OUTPUT (Loopy) ===');
    console.log(JSON.stringify(result, null, 2));
  }
  // If it's a CatCoLab model format
  else if (model.notebook && model.notebook.cells) {
    console.log('=== Processing CatCoLab format model ===');
    
    const nodes = [];
    const nodeIds = {};
    
    // First pass: collect all node names and IDs
    model.notebook.cells.forEach(cell => {
      if (cell.tag === 'formal' && cell.content && cell.content.tag === 'object') {
        const nodeId = cell.content.id;
        const nodeName = cell.content.name || `Node ${nodeId}`;
        nodes.push({ id: nodeId.toString(), name: nodeName });
        nodeIds[nodeId] = nodeName;
      }
    });
    
    // Second pass: collect all relationships
    const edges = [];
    model.notebook.cells.forEach(cell => {
      if (cell.tag === 'formal' && cell.content && cell.content.tag === 'morphism') {
        const type = 
          cell.content.morType?.tag === 'Basic' && cell.content.morType.content === 'Negative' 
            ? 'negative' 
            : 'positive';
        
        const from = cell.content.dom?.content;
        const to = cell.content.cod?.content;
        
        if (from && to && nodeIds[from] && nodeIds[to]) {
          edges.push({
            from: from.toString(),
            to: to.toString(),
            type
          });
        }
      }
    });
    
    result = { nodes, edges };
    console.log('=== simplifyModelForAI OUTPUT (CatCoLab) ===');
    console.log(JSON.stringify(result, null, 2));
  }
  else {
    console.log('=== Unknown model format, returning empty result ===');
    console.log(JSON.stringify(emptyResult, null, 2));
  }
  
  return result;
};

/**
 * Converts a model from Claude's response format to Loopy format
 * @param {Object} model - The model from Claude's response
 * @returns {Object} - The model in Loopy format
 */
export const convertToLoopyFormat = (model) => {
  return {
    nodes: model.nodes.map((node, index) => ({
      id: parseInt(node.id) || index,
      name: node.name || `Node ${index + 1}`,
      x: Math.random() * 800 + 100, // Random position
      y: Math.random() * 400 + 50,  // Random position
      hue: index % 6  // Color based on index
    })),
    edges: model.edges.map((edge, index) => ({
      id: index,
      from: parseInt(edge.from) || 0,
      to: parseInt(edge.to) || 0,
      strength: edge.type === 'negative' ? -1 : 1,
      arc: 0
    })),
    labels: []
  };
};

/**
 * Extracts and parses JSON from Claude's text response
 * @param {string} response - The response from Claude
 * @returns {Object} - The parsed JSON object
 */
export const extractJSONFromResponse = (response) => {
  const jsonMatch = response.match(/```(?:json)?([\s\S]*?)```/) || 
                   response.match(/({[\s\S]*})/) ||
                   [null, response];
  
  const jsonString = jsonMatch[1].trim();
  return JSON.parse(jsonString);
}; 