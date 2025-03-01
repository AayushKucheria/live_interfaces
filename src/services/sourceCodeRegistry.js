/**
 * A registry to store and retrieve the original source code of components.
 * This avoids the issues with toString() returning compiled code.
 */

const sourceCodeRegistry = new Map();

/**
 * Register the source code for a component
 * @param {string} componentName - The name of the component
 * @param {string} sourceCode - The original source code
 */
export function registerSourceCode(componentName, sourceCode) {
  sourceCodeRegistry.set(componentName, sourceCode);
}

/**
 * Get the source code for a component
 * @param {string} componentName - The name of the component
 * @returns {string|null} The original source code or null if not found
 */
export function getSourceCode(componentName) {
  return sourceCodeRegistry.get(componentName) || null;
}

/**
 * Check if source code exists for a component
 * @param {string} componentName - The name of the component
 * @returns {boolean} True if source code exists
 */
export function hasSourceCode(componentName) {
  return sourceCodeRegistry.has(componentName);
}

export default sourceCodeRegistry; 