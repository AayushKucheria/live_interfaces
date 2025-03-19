import React, { createContext, useContext, useState, useEffect } from 'react';
import { styleStore as initialStyleStore, updateComponentColor as updateColorUtil, updateComponentStyle as updateStyleUtil } from './componentStyles';
import './componentAnimations.css';

// Create a context for component styles
export const StyleContext = createContext();

/**
 * StyleProvider manages component styles and provides an API to update them dynamically
 */
export const StyleProvider = ({ children }) => {
  const [styleStore, setStyleStore] = useState(initialStyleStore);
  
  // Get a component's complete style object
  const getStyle = (componentName) => {
    return styleStore[componentName] || {};
  };
  
  // Update a specific style property
  const updateStyle = (componentName, styleProp, value) => {
    if (!(componentName in styleStore)) {
      console.warn(`Component "${componentName}" not found in style store`);
      return false;
    }
    
    if (!(styleProp in styleStore[componentName])) {
      console.warn(`Style property "${styleProp}" not found for component "${componentName}"`);
      return false;
    }
    
    setStyleStore(prev => ({
      ...prev,
      [componentName]: {
        ...prev[componentName],
        [styleProp]: value
      }
    }));
    
    // Also update in the utility for global event triggering
    updateStyleUtil(componentName, styleProp, value);
    
    return true;
  };
  
  // Update color for a specific element
  const updateColor = (componentName, elementName, color) => {
    if (!(componentName in styleStore) || !(elementName in styleStore[componentName])) {
      console.warn(`Component "${componentName}" or element "${elementName}" not found`);
      return false;
    }
    
    const currentClasses = styleStore[componentName][elementName].split(' ');
    const nonColorClasses = currentClasses.filter(cls => 
      !cls.match(/^(text|bg|border|from|via|to)-[a-z]+-[0-9]+$/));
    
    const newClasses = [...nonColorClasses, color].join(' ');
    return updateStyle(componentName, elementName, newClasses);
  };
  
  // Function to update styles through text commands
  const processStyleCommand = (command) => {
    // Simple command parser
    // Expected format: "change [component] [element] to [color/value]"
    const changeColorPattern = /change\s+(\w+)\s+(\w+)\s+to\s+(\w+(?:-\w+)*)/i;
    const match = command.match(changeColorPattern);
    
    if (match) {
      const [_, component, element, color] = match;
      // Handle different kinds of color formats
      if (color.match(/^(red|blue|green|yellow|purple|pink|gray|orange|teal|indigo)$/i)) {
        return updateColor(component, element, `text-${color.toLowerCase()}-500`);
      } else if (color.includes('-')) {
        // Assume it's already a Tailwind color class
        return updateColor(component, element, color);
      }
    }
    
    return false; // Command not recognized
  };
  
  return (
    <StyleContext.Provider value={{ 
      styleStore, 
      getStyle, 
      updateStyle, 
      updateColor,
      processStyleCommand,
      updateComponentStyle: updateStyle  // Alias for component-style API
    }}>
      {children}
    </StyleContext.Provider>
  );
};

// Custom hook to use styles in components
export const useComponentStyles = (componentName) => {
  const { styleStore, getStyle, updateStyle, updateColor } = useContext(StyleContext);
  
  if (!componentName) {
    console.warn('Component name is required for useComponentStyles hook');
    return {};
  }
  
  const styles = getStyle(componentName);
  
  // Listen for style updates
  useEffect(() => {
    const handleStyleUpdate = () => {
      // This will trigger a re-render when styles change
    };
    
    window.addEventListener('component-style-updated', handleStyleUpdate);
    return () => window.removeEventListener('component-style-updated', handleStyleUpdate);
  }, [componentName]);
  
  return {
    styles,
    updateStyle: (prop, value) => updateStyle(componentName, prop, value),
    updateColor: (element, color) => updateColor(componentName, element, color)
  };
};