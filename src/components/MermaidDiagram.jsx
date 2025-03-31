import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with improved configuration
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  logLevel: 'error',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial',
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    useMaxWidth: false
  }
});

/**
 * MermaidDiagram component for rendering mermaid diagrams with zoom/pan capabilities
 * @param {Object} props Component props
 * @param {string} props.chart The mermaid diagram definition
 * @param {Object} props.config Optional mermaid configuration overrides
 */
const MermaidDiagram = ({ chart, config = {} }) => {
  const mermaidRef = useRef(null);
  const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
  const [scale, setScale] = useState(1);
  const [error, setError] = useState(null);

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setScale(1);

  useEffect(() => {
    if (!mermaidRef.current || !chart) return;
    
    // Clear the container and error state
    mermaidRef.current.innerHTML = '';
    setError(null);
    
    const wrapper = document.createElement('div');
    wrapper.className = 'mermaid-wrapper';
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.transformOrigin = 'center center';
    wrapper.style.transition = 'transform 0.2s ease-in-out';
    mermaidRef.current.appendChild(wrapper);

    try {
      // Render the mermaid diagram
      mermaid.render(uniqueId, chart)
        .then(({ svg }) => {
          wrapper.innerHTML = svg;
          
          // Make the SVG responsive and centered
          const svgElement = wrapper.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.margin = '0 auto';
            svgElement.style.display = 'block';
          }
        })
        .catch(error => {
          console.error('Error rendering mermaid diagram:', error, chart);
          setError('Failed to render diagram. Check syntax and try again.');
          wrapper.innerHTML = `<div class="p-4 text-red-500">Error rendering diagram</div>`;
        });
    } catch (error) {
      console.error('Error setting up mermaid diagram:', error);
      setError('Could not initialize diagram renderer.');
      wrapper.innerHTML = `<div class="p-4 text-red-500">Error setting up diagram</div>`;
    }
  }, [chart, uniqueId, scale]);

  return (
    <div className="mermaid-diagram-container w-full">
      {/* Zoom controls */}
      <div className="flex justify-end space-x-2 mb-2">
        <button 
          onClick={zoomOut}
          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          title="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button 
          onClick={resetZoom}
          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          title="Reset zoom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
            <path d="M9 12h6"></path>
            <path d="M12 9v6"></path>
          </svg>
        </button>
        <button 
          onClick={zoomIn}
          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
          title="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
      </div>
      
      {/* Diagram container */}
      <div 
        ref={mermaidRef} 
        className="mermaid-diagram w-full min-h-[250px] flex items-center justify-center overflow-auto"
      />
      
      {/* Error message */}
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default MermaidDiagram; 