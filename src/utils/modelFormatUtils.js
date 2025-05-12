/**
 * Converts a Loopy model to a simplified format for Claude AI
 * @param {Object} model - The model in Loopy format
 * @returns {Object} - The simplified model
 */
export const simplifyModelForAI = (model) => {
  if (!model || !model.nodes) {
    return { nodes: [], edges: [], theory: 'causal-loop', type: 'model' };
  }
  
  return {
    nodes: model.nodes.map(n => ({ id: n.id.toString(), name: n.name })),
    edges: (model.edges || []).map(e => ({ 
      from: e.from.toString(), 
      to: e.to.toString(), 
      type: e.strength < 0 ? 'negative' : 'positive' 
    })),
    theory: model.theory || 'causal-loop',
    type: 'model'
  };
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