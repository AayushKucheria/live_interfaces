import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with basic configuration to avoid issues
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  logLevel: 'error'
});

/**
 * MermaidDiagram component for rendering mermaid diagrams from text definitions
 * @param {Object} props Component props
 * @param {string} props.chart The mermaid diagram definition
 * @param {Object} props.config Optional mermaid configuration overrides
 */
const MermaidDiagram = ({ chart, config = {} }) => {
  const mermaidRef = useRef(null);
  const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 11)}`;

  useEffect(() => {
    if (!mermaidRef.current || !chart) return;
    
    // Clear the container first
    mermaidRef.current.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'mermaid-wrapper';
    mermaidRef.current.appendChild(wrapper);

    try {
      // For debugging
      const pre = document.createElement('pre');
      pre.style.display = 'none';
      pre.textContent = chart;
      wrapper.appendChild(pre);
      
      // Simple mermaid rendering
      mermaid.render(uniqueId, chart)
        .then(({ svg }) => {
          wrapper.innerHTML = svg;
        })
        .catch(error => {
          console.error('Error rendering mermaid diagram:', error, chart);
          wrapper.innerHTML = `<div class="p-4 text-red-500">Error rendering diagram</div>`;
        });
    } catch (error) {
      console.error('Error setting up mermaid diagram:', error);
      wrapper.innerHTML = `<div class="p-4 text-red-500">Error setting up diagram</div>`;
    }
  }, [chart, uniqueId]);

  return (
    <div className="mermaid-diagram-container w-full">
      <div ref={mermaidRef} className="mermaid-diagram w-full h-auto min-h-[200px]" />
    </div>
  );
};

export default MermaidDiagram; 