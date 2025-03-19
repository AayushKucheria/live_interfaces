import React, { useState, useEffect } from 'react';
import { useComponentStyles } from '../../styles/StyleProvider';

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
  const { styles } = useComponentStyles('EncouragementFeedback');

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
  
  // Format the message content based on the template
  const formatMessage = (message) => {
    if (!styles.messageContent) return message;
    return styles.messageContent.replace('$message', message);
  };
  
  return (
    <div className={`${styles.container} ${className}`} {...props}>
      {children}
      
      {isVisible && (
        <div className={styles.message}>
          {formatMessage(encouragement)}
        </div>
      )}
    </div>
  );
};

// Attach metadata as a property
EncouragementFeedback.metadata = {
  title: "Encouragement Feedback",
  description: "Provides positive reinforcement as users interact with the interface",
  category: "creative"
};

// Example usage for demo purposes
EncouragementFeedback.Example = () => {
  const [inputValue, setInputValue] = useState("");
  
  return (
    <div className="space-y-4">
      <EncouragementFeedback inputValue={inputValue}>
        <textarea
          className="w-full p-3 border rounded-md"
          placeholder="Start typing to see encouragement..."
          rows={4}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </EncouragementFeedback>
      
      <div className="text-sm text-gray-500">
        Type more than 10 characters to see encouragement
      </div>
    </div>
  );
};

export default EncouragementFeedback; 