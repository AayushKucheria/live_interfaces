import React, { useState, useContext } from 'react';
import { StyleContext } from '../styles/StyleProvider';

/**
 * Component that provides an interface for updating styles through text commands
 * Simplified for demo purposes to show how natural language can control components
 */
const StyleCommandInterface = ({ selectedComponent = null }) => {
  const [command, setCommand] = useState('');
  const [feedback, setFeedback] = useState('');
  const { updateComponentStyle, updateColor } = useContext(StyleContext);

  // Demo-specific commands that work for each component - simplified and conversational
  const demoCommands = {
    EncouragementFeedback: [
      {
        text: "make it pop",
        action: () => updateComponentStyle('EncouragementFeedback', 'messageContent', '✨ $message ✨')
      },
      {
        text: "chill it out",
        action: () => updateColor('EncouragementFeedback', 'message', 'text-blue-400')
      }
    ],
    FadeWithContext: [
      {
        text: "more contrast",
        action: () => {
          // Make active items fully opaque and add a subtle scale effect
          updateComponentStyle('FadeWithContext', 'activeOpacity', 1);
          // Make inactive items extremely faded
          updateComponentStyle('FadeWithContext', 'inactiveOpacityBase', 0.05);
          // Add scale effect to item class
          updateComponentStyle('FadeWithContext', 'item', 'transition-all duration-300 ease-in-out py-2 transform scale-100');
          // Increase opacity step to create sharper falloff
          updateComponentStyle('FadeWithContext', 'opacityStep', 0.3);
          return true;
        }
      },
      {
        text: "bold the active one",
        action: () => updateComponentStyle('FadeWithContext', 'item', 'transition-all duration-300 ease-in-out py-2 font-bold')
      }
    ]
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!command.trim()) {
      setFeedback('Type something!');
      return;
    }
    
    if (!selectedComponent) {
      setFeedback('Click on a component first');
      return;
    }
    
    // Find matching demo command
    const componentCommands = demoCommands[selectedComponent] || [];
    const matchingCommand = componentCommands.find(cmd => 
      command.toLowerCase().includes(cmd.text.toLowerCase()));
    
    if (matchingCommand) {
      const success = matchingCommand.action();
      
      if (success !== false) {
        setFeedback(`Done! "${matchingCommand.text}"`);
        setCommand('');
      } else {
        setFeedback('Hmm, that didn\'t work');
      }
    } else {
      // Fallback general color change
      const colorMatch = /make it (red|blue|green|yellow|purple|pink|orange)/i.exec(command);
      if (colorMatch) {
        const color = colorMatch[1].toLowerCase();
        const success = updateColor(selectedComponent, 'message', `text-${color}-500`);
        
        if (success) {
          setFeedback(`Made it ${color}!`);
          setCommand('');
        } else {
          setFeedback(`Can't do that color here`);
        }
      } else {
        setFeedback(
          <>
            <p>Try saying:</p>
            <ul className="mt-1 text-sm font-medium">
              {(demoCommands[selectedComponent] || []).map((cmd, i) => (
                <li key={i}>• "{cmd.text}"</li>
              ))}
              <li>• "make it red" (or any color)</li>
            </ul>
          </>
        );
      }
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md backdrop-blur-sm bg-opacity-95">
      <h3 className="text-lg font-medium mb-2">AI Style Assistant</h3>
      
      {selectedComponent ? (
        <div className="mb-3 text-sm">
          <span className="font-medium">Selected:</span> 
          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded">{selectedComponent}</span>
        </div>
      ) : (
        <p className="text-sm text-gray-600 mb-3">
          Click on a component first, then tell me how to change it
        </p>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder={selectedComponent ? 
              `Try: "${demoCommands[selectedComponent]?.[0]?.text || 'make it pop'}"` : 
              "Select a component first..."}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Apply
        </button>
      </form>
      
      {feedback && (
        <div className={`mt-3 p-2 rounded ${typeof feedback === 'object' || feedback.includes('Try') ? 'bg-blue-50 text-blue-800' : feedback.includes('Hmm') || feedback.includes('Can\'t') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {feedback}
        </div>
      )}
    </div>
  );
};

export default StyleCommandInterface; 