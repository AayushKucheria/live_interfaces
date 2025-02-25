import React, { useState, useEffect } from 'react';

const encouragements = [
  "That's a great point!",
  "Keep going, you're on a roll!",
  "Interesting thought...",
  "I love where you're going with this",
  "Your ideas are flowing nicely",
  "You're making excellent progress",
  "That's a unique perspective!",
];

const EncouragementFeedback = ({ 
  inputValue = "", 
  showEncouragement = true,
  encouragementDelay = 1500,
  className = "", 
  children,
  ...props 
}) => {
  const [encouragement, setEncouragement] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!showEncouragement || !inputValue) {
      setIsVisible(false);
      return;
    }
    
    const timer = setTimeout(() => {
      if (inputValue.length > 10) {
        const randomIndex = Math.floor(Math.random() * encouragements.length);
        setEncouragement(encouragements[randomIndex]);
        setIsVisible(true);
      }
    }, encouragementDelay);
    
    return () => clearTimeout(timer);
  }, [inputValue, showEncouragement, encouragementDelay]);
  
  return (
    <div className={`encouragement-feedback-pattern ${className}`} {...props}>
      {children}
      
      {isVisible && (
        <div className="encouragement-message text-purple-500 italic text-sm mt-1 opacity-0 animate-fadeIn">
          {encouragement}
        </div>
      )}
    </div>
  );
};

// Attach metadata as a property
EncouragementFeedback.metadata = {
  title: "Encouragement Feedback",
  description: "Provides subtle encouragement and feedback while users write",
  category: "creative"
};

// Example usage
EncouragementFeedback.Example = () => {
  const [inputValue, setInputValue] = useState("");
  
  return (
    <div className="space-y-4">
      <EncouragementFeedback inputValue={inputValue}>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Start writing something..."
          className="w-full p-3 border border-slate-200 rounded-lg"
          rows={4}
        />
      </EncouragementFeedback>
      
      <p className="text-sm text-slate-500">
        Type more than a few words to see encouragement appear
      </p>
    </div>
  );
};

export default EncouragementFeedback; 