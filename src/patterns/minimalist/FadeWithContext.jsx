import React from 'react';
import { useComponentStyles } from '../../styles/StyleProvider';

const FadeWithContext = ({ entries = [], activeIndex = -1, className = "", ...props }) => {
  // Use our style hook to get styles for this component
  const { styles } = useComponentStyles('FadeWithContext');
  
  return (
    <div className={`${styles.container} ${className}`} {...props}>
      {entries.map((entry, index) => {
        // Calculate opacity based on distance from active item
        const distance = Math.abs(index - activeIndex);
        const opacity = activeIndex === -1 ? 
          styles.activeOpacity : 
          Math.max(styles.inactiveOpacityBase, styles.activeOpacity - (distance * styles.opacityStep));
        
        return (
          <div 
            key={index}
            className={styles.item}
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