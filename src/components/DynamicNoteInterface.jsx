import React, { useState } from 'react';

const DynamicNoteInterface = ({ config }) => {
  const [entries, setEntries] = useState([]);
  const [currentInput, setCurrentInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      setEntries([...entries, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  return (
    <div className={config.style.container}>
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className={config.style.entry}>
            <span className="mr-2">{config.style.bullet}</span>
            <span>{entry}</span>
          </div>
        ))}
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your thoughts..."
          className={config.style.input}
        />
      </div>
    </div>
  );
};

export default DynamicNoteInterface; 