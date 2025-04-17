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
  You are an AI assistant specialized in causal modeling, helping users understand and improve their models.
  
  Your task is to analyze a causal model and suggest ways to extend or refine it.
  
  Generate thread suggestions in the following format:
  {
    "threads": [
      {
        "id": "thread_id",
        "label": "Thread Label",
        "description": "Brief description of this thread",
        "suggestions": [
          {
            "id": "suggestion_id",
            "title": "Suggestion Title",
            "description": "Detailed explanation of the suggestion (1-3 sentences)"
          },
          // More suggestions...
        ]
      },
      // More threads...
    ]
  }
  
  Include threads that help users:
  1. Add new variables to their model
  2. Increase the nuance of existing relationships
  3. Simplify parts of the model while preserving key dynamics
  4. Any other relevant one-step improvements
  
  Return ONLY valid JSON without additional text or explanation.
  `;

  // User message that includes the simplified model
  const userMessage = `
  Please analyze this causal model and suggest threads for improvement:
  ${JSON.stringify(simplifiedModel, null, 2)}
  
  Generate thread suggestions that would help extend or refine this model in a one-step way.
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
 * Simplify a complex model for AI processing
 * @param {Object} model - The original complex model
 * @returns {Object} - A simplified version of the model
 */
const simplifyModelForAI = (model) => {
  // If model is null or undefined, return an empty structure
  if (!model) {
    return { nodes: [], edges: [], theory: 'causal-loop' };
  }
  
  // Handle Loopy format - convert to simplified structure
  if (model.nodes && Array.isArray(model.nodes)) {
    return {
      nodes: model.nodes.map(node => ({
        id: node.id.toString(),
        name: node.name || `Node ${node.id}`
      })),
      edges: (model.edges || []).map(edge => ({
        from: edge.from.toString(),
        to: edge.to.toString(),
        type: edge.strength < 0 ? 'negative' : 'positive'
      })),
      theory: model.theory || 'causal-loop'
    };
  }
  
  // If it's a CatCoLab model format, parse it differently
  if (model.notebook && model.notebook.cells) {
    const nodes = [];
    const edges = [];
    
    // Extract nodes and edges from the notebook cells
    model.notebook.cells.forEach(cell => {
      if (cell.tag === 'formal' && cell.content) {
        // Extract objects (nodes)
        if (cell.content.tag === 'object') {
          nodes.push({
            id: cell.content.id,
            name: cell.content.name || 'Unnamed'
          });
        }
        // Extract morphisms (edges)
        else if (cell.content.tag === 'morphism') {
          const morphismType = 
            cell.content.morType?.tag === 'Basic' && cell.content.morType.content === 'Negative' 
              ? 'negative' 
              : 'positive';
          
          const from = cell.content.dom?.content;
          const to = cell.content.cod?.content;
          
          if (from && to) {
            edges.push({
              from,
              to,
              type: morphismType
            });
          }
        }
      }
    });
    
    return {
      nodes,
      edges,
      theory: model.theory || 'causal-loop',
      type: model.type || 'model'
    };
  }
  
  // For any other format, try to extract the essential structure
  return {
    nodes: Object.keys(model).filter(key => typeof model[key] === 'object').map(key => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
    })),
    edges: [],
    theory: 'causal-loop'
  };
}; 