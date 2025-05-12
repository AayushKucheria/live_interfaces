import { sendMessageToClaude } from './openRouterService';

/**
 * Generates thread suggestions for model modification based on the current model
 * @param {Object} model - The current model in simplified format
 * @returns {Promise<Object>} - Object containing thread suggestions from Claude
 */
export const generateThreadSuggestions = async (model) => {
  // Create a simplified representation of the model to send to the AI
  const simplifiedModel = simplifyModelForAI(model);
  
  // System prompt to guide Claude's response
  const systemPrompt = `
  You are an AI specialized in causal modeling. Analyze this model and generate specific, one-step improvement suggestions.

  OUTPUT FORMAT:
  {
    "threads": [
      {
        "id": "thread_id",
        "label": "Thread Label",
        "description": "Brief description",
        "suggestions": [
          {
            "id": "suggestion_id", 
            "title": "Suggestion Title",
            "description": "Detailed explanation (1-3 sentences)"
          }
        ]
      }
    ]
  }
  
  THREAD TYPES:
  1. Add new variables
  2. Increase relationship nuance
  3. Simplify while preserving dynamics
  
  QUALITY CRITERIA:
  - Specific and directly relevant to the existing model
  - Clearly explain interaction with existing variables
  - Describe potential new dynamics that would emerge
  - Domain-appropriate and realistic
  - Implementable in a single step
  - Generate EXACTLY 3 suggestions per thread type, no more and no less
  
  EXAMPLES (for a fox-rabbit predator-prey model):
  
  Adding Variables:
  - "Add Vegetation": Creates positive effect on rabbits, forming loop: vegetation → rabbits(+) → foxes(+) → rabbits(-) → vegetation(+)
  - "Add Disease": Negatively affects population, creating temporary disruptions and oscillations in the predator-prey balance
  
  Increasing Nuance:
  - "Add Time Delays": Create realistic population cycles by delaying effects between predator and prey populations
  - "Add Population Thresholds": Implement carrying capacity where predator efficiency decreases below certain prey density
  
  Identify the domain from existing variables and tailor suggestions appropriately. Return ONLY valid JSON.
  `;

  // User message that includes the simplified model
  const userMessage = `
  Please analyze this causal model and suggest threads for improvement:
  ${JSON.stringify(simplifiedModel, null, 2)}
  
  Generate thread suggestions that would help extend or refine this model in a one-step way, as described in your system message.
  `;

  try {
    // Send to Claude and get the response
    const response = await sendMessageToClaude(userMessage, systemPrompt);
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (in case Claude adds extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON pattern found, try parsing directly
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Error parsing Claude response as JSON:', parseError);
      // Return a default structure if parsing fails
      return {
        threads: [
          {
            id: 'add_variable',
            label: 'Add another variable',
            description: 'Introduce a new factor to the system',
            suggestions: [
              {
                id: 'generic_suggestion',
                title: 'Add a Related Factor',
                description: 'Consider what other variables might affect your model.'
              }
            ]
          }
        ]
      };
    }
  } catch (error) {
    console.error('Error getting thread suggestions from Claude:', error);
    throw error;
  }
};

/**
 * Simplify a complex model for AI processing, focusing only on essential elements
 * 
 * @param {Object} model - The original complex model in various possible formats
 * 
 * @returns {Object} - Minimal representation with only essential elements:
 *   {
 *     nodes: [string, string, ...], // List of node names
 *     relationships: [
 *       {from: string, to: string, effect: "positive"|"negative"} // Causal connections using node names
 *     ]
 *   }
 */
const simplifyModelForAI = (model) => {
  console.log('=== simplifyModelForAI INPUT ===');
  console.log(JSON.stringify(model, null, 2));
  
  // If model is null or undefined, return an empty structure
  if (!model) {
    const emptyResult = { nodes: [], relationships: [] };
    console.log('=== simplifyModelForAI OUTPUT (empty) ===');
    console.log(JSON.stringify(emptyResult, null, 2));
    return emptyResult;
  }
  
  // Handle Loopy format
  if (model.nodes && Array.isArray(model.nodes)) {
    console.log('=== Processing Loopy format model ===');
    
    // Create a map of id to name for reference
    const idToName = {};
    model.nodes.forEach(node => {
      idToName[node.id] = node.name || `Node ${node.id}`;
    });
    
    console.log('Node ID to Name mapping:', idToName);
    
    const result = {
      nodes: model.nodes.map(node => node.name || `Node ${node.id}`),
      relationships: (model.edges || []).map(edge => ({
        from: idToName[edge.from],
        to: idToName[edge.to],
        effect: edge.strength < 0 ? 'negative' : 'positive'
      }))
    };
    
    console.log('=== simplifyModelForAI OUTPUT (Loopy) ===');
    console.log(JSON.stringify(result, null, 2));
    return result;
  }
  
  // If it's a CatCoLab model format
  if (model.notebook && model.notebook.cells) {
    console.log('=== Processing CatCoLab format model ===');
    
    const nodes = [];
    const nodeIds = {};
    const relationships = [];
    
    // First pass: collect all node names and IDs
    model.notebook.cells.forEach(cell => {
      if (cell.tag === 'formal' && cell.content && cell.content.tag === 'object') {
        const nodeName = cell.content.name || `Node ${cell.content.id}`;
        nodes.push(nodeName);
        nodeIds[cell.content.id] = nodeName;
      }
    });
    
    console.log('CatCoLab nodes:', nodes);
    console.log('Node ID mapping:', nodeIds);
    
    // Second pass: collect all relationships
    model.notebook.cells.forEach(cell => {
      if (cell.tag === 'formal' && cell.content && cell.content.tag === 'morphism') {
        const effectType = 
          cell.content.morType?.tag === 'Basic' && cell.content.morType.content === 'Negative' 
            ? 'negative' 
            : 'positive';
        
        const from = cell.content.dom?.content;
        const to = cell.content.cod?.content;
        
        if (from && to && nodeIds[from] && nodeIds[to]) {
          relationships.push({
            from: nodeIds[from],
            to: nodeIds[to],
            effect: effectType
          });
        }
      }
    });
    
    const result = { nodes, relationships };
    console.log('=== simplifyModelForAI OUTPUT (CatCoLab) ===');
    console.log(JSON.stringify(result, null, 2));
    return result;
  }
  
  // For any other format, try to extract the essential structure
  console.log('=== Processing generic model format ===');
  
  const result = {
    nodes: Object.keys(model)
      .filter(key => typeof model[key] === 'object')
      .map(key => key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')),
    relationships: []
  };
  
  console.log('=== simplifyModelForAI OUTPUT (generic) ===');
  console.log(JSON.stringify(result, null, 2));
  return result;
}; 