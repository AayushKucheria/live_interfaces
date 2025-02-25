import React from 'react';

const FadeWithContext = ({ entries = [], activeIndex = -1, className = "", ...props }) => {
  return (
    <div className={`fade-with-context-pattern ${className}`} {...props}>
      {entries.map((entry, index) => {
        // Calculate opacity based on distance from active item
        const distance = Math.abs(index - activeIndex);
        const opacity = activeIndex === -1 ? 1 : Math.max(0.3, 1 - (distance * 0.2));
        
        return (
          <div 
            key={index}
            className="transition-opacity duration-300 ease-in-out py-2"
            style={{ opacity }}
          >
            {entry}
          </div>
        );
      })}
    </div>
  );
};

// Attach metadata as a property
FadeWithContext.metadata = {
  title: "Fade With Context",
  description: "Items fade as they become less relevant but remain visible for context",
  category: "minimalist"
};

// Example usage for demo purposes
FadeWithContext.Example = () => {
  const [activeIndex, setActiveIndex] = React.useState(1);
  const sampleEntries = [
    <div className="p-3 bg-slate-100 rounded">First thought</div>,
    <div className="p-3 bg-slate-100 rounded">Important concept</div>,
    <div className="p-3 bg-slate-100 rounded">Related idea</div>,
    <div className="p-3 bg-slate-100 rounded">Another thought</div>
  ];
  
  return (
    <div className="space-y-4">
      <FadeWithContext entries={sampleEntries} activeIndex={activeIndex} />
      <div className="flex justify-center space-x-2 mt-4">
        {sampleEntries.map((_, index) => (
          <button 
            key={index}
            className={`px-3 py-1 rounded ${activeIndex === index ? 'bg-slate-600 text-white' : 'bg-slate-200'}`}
            onClick={() => setActiveIndex(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FadeWithContext; 