// Component style management system
// Centralized storage for component styles that can be easily modified

// Style store - holds all component styles
export const styleStore = {
  // Minimalist patterns
  FadeWithContext: {
    container: 'fade-with-context-pattern',
    item: 'transition-opacity duration-300 ease-in-out py-2',
    activeOpacity: 1,
    inactiveOpacityBase: 0.3,
    opacityStep: 0.2,
  },
  
  // Creative patterns
  EncouragementFeedback: {
    container: 'encouragement-feedback-pattern',
    message: 'encouragement-message text-purple-500 italic text-sm mt-1 opacity-0 animate-fadeIn',
    messageContent: '$message', // Template for message content, $message gets replaced with actual message
  },
  
  // Navigation patterns
  DirectionalFocus: {
    container: 'directional-focus-pattern',
    focusedItem: 'border-2 border-blue-500 rounded transition-all duration-200',
    item: 'border-2 border-transparent rounded',
  },
  
  // Loading patterns
  ContentAnticipationShimmer: {
    container: 'content-anticipation-shimmer-pattern',
    shimmer: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded',
  },
};

// Functions to get and update styles
export const getComponentStyle = (componentName) => {
  return styleStore[componentName] || {};
};

export const updateComponentStyle = (componentName, styleProp, value) => {
  if (styleStore[componentName] && styleProp in styleStore[componentName]) {
    styleStore[componentName] = {
      ...styleStore[componentName],
      [styleProp]: value,
    };
    
    // Trigger re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('component-style-updated', {
      detail: { componentName, styleProp, value }
    }));
    
    return true;
  }
  return false;
};

// Utility to update CSS color properties
export const updateComponentColor = (componentName, elementName, color) => {
  const style = getComponentStyle(componentName);
  if (style && elementName in style) {
    // Replace any existing color classes with the new color
    const currentClasses = style[elementName].split(' ');
    const nonColorClasses = currentClasses.filter(cls => 
      !cls.match(/^(text|bg|border|from|via|to)-[a-z]+-[0-9]+$/));
    
    const newClasses = [...nonColorClasses, color].join(' ');
    return updateComponentStyle(componentName, elementName, newClasses);
  }
  return false;
}; 