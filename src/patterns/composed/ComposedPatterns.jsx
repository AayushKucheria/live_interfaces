import React, { useState } from 'react';
import FadeWithContext from '../minimalist/FadeWithContext';
import EncouragementFeedback from '../creative/EncouragementFeedback';
import AutoTagging from '../structured/AutoTagging';

const ComposedPatterns = ({ className = "", ...props }) => {
  const [entries, setEntries] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [tags, setTags] = useState([]);
  
  const handleInputChange = (e) => {
    setCurrentInput(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentInput.trim()) {
      setEntries(prev => [...prev, currentInput.trim()]);
      setCurrentInput('');
      setActiveIndex(entries.length); // Focus the new entry
    }
  };
  
  const handleTagsGenerated = (newTags) => {
    setTags(newTags);
  };
  
  return (
    <div className={`composed-patterns-container ${className}`} {...props}>
      <div className="space-y-6">
        {/* Entries with fade context */}
        <FadeWithContext 
          entries={entries.map((entry, index) => (
            <div 
              key={index}
              className="p-4 bg-white rounded-lg shadow-sm cursor-pointer"
              onClick={() => setActiveIndex(index)}
            >
              {entry}
            </div>
          ))} 
          activeIndex={activeIndex} 
        />
        
        {/* Form with encouragement and auto-tagging */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4">
          <AutoTagging 
            text={currentInput}
            onTagsGenerated={handleTagsGenerated}
          >
            <EncouragementFeedback
              inputValue={currentInput}
              encouragementDelay={1000}
            >
              <textarea
                value={currentInput}
                onChange={handleInputChange}
                placeholder="Write your thoughts..."
                className="w-full p-3 border border-slate-200 rounded-lg"
                rows={3}
              />
            </EncouragementFeedback>
          </AutoTagging>
          
          <div className="mt-3 flex justify-between items-center">
            <div className="text-sm text-slate-500">
              {tags.length > 0 ? 'Auto-detected tags' : 'Tags will appear as you type'}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg transition-colors"
              disabled={!currentInput.trim()}
            >
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Attach metadata as a property
ComposedPatterns.metadata = {
  title: "Composed Patterns",
  description: "Multiple patterns working together to create a rich interface",
  category: "composed"
};

// Example is the component itself
ComposedPatterns.Example = () => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        This example combines Fade With Context, Encouragement Feedback, and Auto Tagging patterns
      </p>
      <ComposedPatterns />
    </div>
  );
};

export default ComposedPatterns; 