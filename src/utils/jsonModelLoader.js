/**
 * Utility to dynamically load all JSON models from the json_models directory
 */

// Dynamic imports to load all JSON files in the json_models directory
const importAllJsonModels = () => {
  // Use Webpack's require.context to load all JSON files dynamically
  const context = import.meta.glob('../json_models/*.json', { eager: true });
  const models = {};

  // Process each file
  Object.entries(context).forEach(([path, module]) => {
    // Extract filename from path (e.g., '../json_models/wolfchickens.json' -> 'wolfchickens.json')
    const filename = path.split('/').pop();
    models[filename] = module.default;
  });

  return models;
};

// Helper function to format model names for display
export const formatModelName = (filename) => {
  return filename
    .replace('.json', '')
    .split(/(?=[A-Z])|[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Export all models as a single object
export const jsonModels = importAllJsonModels();

// Store user-created models that will exist only for the current session
export const userModels = {};

/**
 * Add a new model to the in-memory collection
 * @param {Object} modelData - The model data to add
 * @param {string} modelName - Name to use for the model
 * @returns {string} - The filename of the added model
 */
export const addModelToLibrary = (modelData, modelName) => {
  // Sanitize and format the model name
  let sanitizedName = modelName
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase();
  
  // If name is empty or undefined, generate a name
  if (!sanitizedName) {
    sanitizedName = `user_model_${Date.now()}`;
  }
  
  // Add .json extension if not present
  const filename = sanitizedName.endsWith('.json') ? sanitizedName : `${sanitizedName}.json`;
  
  // Add model to the user models collection
  userModels[filename] = modelData;
  
  // Add model to the combined models collection
  jsonModels[filename] = modelData;
  
  return filename;
};

// Export a sorted list of model names for easy display in UI components
export const getModelNames = () => {
  return Object.keys({...jsonModels, ...userModels}).sort((a, b) => {
    // Sort alphabetically but put the basic models first
    const basicModels = ['wolfchickens.json', 'wolfchickenworm.json', 'wormedwolves.json', 'causal-loop-json.json'];
    const aIsBasic = basicModels.includes(a);
    const bIsBasic = basicModels.includes(b);
    
    if (aIsBasic && !bIsBasic) return -1;
    if (!aIsBasic && bIsBasic) return 1;
    return a.localeCompare(b);
  });
};

// Get a specific model by name
export const getModelByName = (modelName) => {
  return jsonModels[modelName] || userModels[modelName];
}; 