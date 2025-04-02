import React, { useEffect, useRef, useState, useCallback } from 'react';
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
 * @param {boolean} props.compact Whether to render in compact mode for sidebar
 */
const MermaidDiagram = ({ chart, config = {}, compact = false }) => {
  const mermaidRef = useRef(null);
  const chartRef = useRef(chart); // Track chart changes
  const [scale, setScale] = useState(1);
  const [error, setError] = useState(null);

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setScale(1);
  
  // Render function to keep logic in one place
  const renderMermaid = useCallback(() => {
    if (!mermaidRef.current || !chart) return;
    
    // Initialize render config
    const renderConfig = {
      ...config,
      fontFamily: 'system-ui, sans-serif',
      flowchart: {
        curve: 'basis',
        htmlLabels: true,
        padding: compact ? 2 : 15,
        nodeSpacing: compact ? 10 : 50,
        rankSpacing: compact ? 20 : 70
      }
    };

    // Reset the container and apply scale transform
    mermaidRef.current.innerHTML = `<div class="mermaid-wrapper" style="transform: scale(${scale}); transform-origin: ${compact ? 'top' : 'center'} center; transition: transform 0.2s ease-in-out;">${chart}</div>`;

    // Ensure the DOM is ready before rendering
    try {
      mermaid.init(renderConfig, '.mermaid-wrapper');
      
      // Apply compact styling if needed
      if (compact && mermaidRef.current) {
        const svgElement = mermaidRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.maxWidth = '100%';
          svgElement.style.height = 'auto';
          svgElement.style.fontSize = '0.8em';
          
          const textElements = svgElement.querySelectorAll('text');
          textElements.forEach(text => {
            text.style.fontSize = '0.9em';
          });
        }
      }
    } catch (err) {
      console.error('Error rendering mermaid diagram:', err);
      setError('Failed to render diagram. Check syntax and try again.');
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = `<div class="p-2 text-red-500 text-xs">Error rendering diagram</div>`;
      }
    }
  }, [chart, scale, compact, config]);

  // Trigger rendering when the chart or other essential props change
  useEffect(() => {
    // Reset error state
    setError(null);
    
    // Skip if no ref or no chart
    if (!mermaidRef.current || !chart) return;
    
    // Track if chart changed
    const chartChanged = chartRef.current !== chart;
    chartRef.current = chart;
    
    // Only render if something important changed
    renderMermaid();
    
    // Cleanup function
    return () => {
      // Optional cleanup if needed
    };
  }, [chart, scale, compact, config, renderMermaid]);

  // Compact mode has minimal controls and smaller size
  if (compact) {
    return (
      <div className="mermaid-diagram-container w-full">
        <div 
          ref={mermaidRef} 
          className="mermaid-diagram w-full min-h-[80px] flex items-center justify-center overflow-hidden"
          onClick={resetZoom}
        />
        
        {error && (
          <div className="mt-1 text-red-500 text-xs">
            {error}
          </div>
        )}
      </div>
    );
  }

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