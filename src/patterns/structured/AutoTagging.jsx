import React, { useState, useEffect, useCallback } from 'react';

// In a real implementation, this would use NLP or an AI service
const generateTags = (text) => {
  const commonTopics = [
    { keyword: "research", tag: "Research" },
    { keyword: "meeting", tag: "Meeting" },
    { keyword: "idea", tag: "Idea" },
    { keyword: "task", tag: "Task" },
    { keyword: "project", tag: "Project" },
    { keyword: "reminder", tag: "Reminder" },
    { keyword: "question", tag: "Question" },
    { keyword: "note", tag: "Note" }
  ];
  
  return commonTopics
    .filter(topic => text.toLowerCase().includes(topic.keyword))
    .map(topic => topic.tag);
};

const AutoTagging = ({ 
  text = "", 
  onTagsGenerated = () => {}, 
  className = "", 
  children, 
  ...props 
}) => {
  const [tags, setTags] = useState([]);
  const stableOnTagsGenerated = useCallback(onTagsGenerated, []);
  
  useEffect(() => {
    if (text.length > 5) {
      const newTags = generateTags(text);
      if (JSON.stringify(newTags) !== JSON.stringify(tags)) {
        setTags(newTags);
        stableOnTagsGenerated(newTags);
      }
    } else if (tags.length > 0) {
      setTags([]);
      stableOnTagsGenerated([]);
    }
  }, [text, tags, stableOnTagsGenerated]);
  
  return (
    <div className={`auto-tagging-pattern ${className}`} {...props}>
      {children}
      
      {tags.length > 0 && (
        <div className="tags-container mt-3 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Attach metadata as a property
AutoTagging.metadata = {
  title: "Auto Tagging",
  description: "Automatically suggests tags based on content",
  category: "structured"
};

// Example usage
AutoTagging.Example = () => {
  const [inputValue, setInputValue] = useState("");
  
  return (
    <div className="space-y-3">
      <AutoTagging text={inputValue}>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Try typing about meetings, tasks, ideas, projects, etc."
          className="w-full p-3 border border-slate-200 rounded-lg"
          rows={3}
        />
      </AutoTagging>
      
      <p className="text-sm text-slate-500">
        Type keywords like "meeting", "task", or "idea" to see tags appear
      </p>
    </div>
  );
};

export default AutoTagging; 