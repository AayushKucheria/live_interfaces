import React, { useRef, useEffect, useState } from 'react';

// Find the nearest element in a specific direction
const findNearestInDirection = (elements, currentElement, direction) => {
  if (!currentElement || elements.length === 0) return null;
  
  const currentRect = currentElement.getBoundingClientRect();
  const currentCenter = {
    x: currentRect.left + currentRect.width / 2,
    y: currentRect.top + currentRect.height / 2
  };
  
  // Filter elements based on direction
  let candidates = [];
  switch (direction) {
    case 'ArrowUp':
      candidates = Array.from(elements).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.bottom < currentRect.top;
      });
      break;
    case 'ArrowDown':
      candidates = Array.from(elements).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.top > currentRect.bottom;
      });
      break;
    case 'ArrowLeft':
      candidates = Array.from(elements).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.right < currentRect.left;
      });
      break;
    case 'ArrowRight':
      candidates = Array.from(elements).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.left > currentRect.right;
      });
      break;
    default:
      return null;
  }
  
  if (candidates.length === 0) return null;
  
  // Find the closest element
  return candidates.reduce((closest, element) => {
    const rect = element.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    const distance = Math.sqrt(
      Math.pow(center.x - currentCenter.x, 2) + 
      Math.pow(center.y - currentCenter.y, 2)
    );
    
    if (!closest || distance < closest.distance) {
      return { element, distance };
    }
    return closest;
  }, null)?.element;
};

const DirectionalFocus = ({ children, className = "", ...props }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleKeyDown = (e) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        return;
      }
      
      e.preventDefault();
      
      const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusableElements.length === 0) return;
      
      const activeElement = document.activeElement;
      
      // If no element is focused yet, focus the first one
      if (!container.contains(activeElement)) {
        focusableElements[0].focus();
        return;
      }
      
      const nearestElement = findNearestInDirection(focusableElements, activeElement, e.key);
      if (nearestElement) {
        nearestElement.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div ref={containerRef} className={`directional-focus ${className}`} {...props}>
      {children}
    </div>
  );
};

// Attach metadata as a property instead of a separate export
DirectionalFocus.metadata = {
  title: "Directional Focus Navigation",
  description: "Navigate UI elements using arrow keys based on spatial arrangement",
  category: "navigation"
};

// Example usage as a property
DirectionalFocus.Example = () => {
  const [focusedButton, setFocusedButton] = useState(null);
  
  return (
    <DirectionalFocus>
      <p className="mb-3 text-sm text-slate-500">Use arrow keys to navigate between buttons:</p>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            className={`p-4 rounded ${
              focusedButton === num ? 'bg-emerald-100 border-emerald-300' : 'bg-slate-100'
            } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            onFocus={() => setFocusedButton(num)}
            onBlur={() => setFocusedButton(null)}
          >
            Item {num}
          </button>
        ))}
      </div>
    </DirectionalFocus>
  );
};

export default DirectionalFocus; 