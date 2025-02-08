import React, { useState } from 'react';

const CreatorTag = ({ name, isLiked, onToggleLike }) => (
  <div className="inline-flex items-center px-3 py-1 bg-white/80 backdrop-blur-sm 
                rounded-full text-sm text-slate-700 shadow-sm">
    {name}
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onToggleLike(e);
      }}
      className="ml-1.5 p-1 hover:bg-white/50 rounded-full transition-colors"
    >
      {isLiked ? '❤️' : '🤍'}
    </button>
  </div>
);

const PreferenceSummary = ({ 
  preferences = { style: new Set() },
  subscribedCreators = new Set(),
  onSubscribe, 
  onEdit 
}) => {
  // Generate description based on preferences
  const getDescription = () => {
    if (!preferences.purpose) return '';
    const purpose = preferences.purpose;
    const styles = Array.from(preferences.style || new Set()).join(' and ');
    return `A ${styles.toLowerCase()} interface designed for ${purpose.toLowerCase()}, combining the best elements for your workflow.`;
  };

  // Updated to include subscription handling
  const getRelevantCreators = () => {
    const creatorTags = [];
    
    if (preferences.style.has('Minimalist')) {
      creatorTags.push({ id: 'jun', name: "Zen by Jun Tanaka" });
    }
    if (preferences.style.has('Professional')) {
      creatorTags.push({ id: 'marcus', name: "Connectivity by Marcus Chen" });
    }
    if (preferences.style.has('Creative')) {
      creatorTags.push({ id: 'luna', name: "Creative Flow by Luna Martinez" });
    }
    
    return creatorTags;
  };

  return (
    <div className="w-full bg-sky-100/80 backdrop-blur-sm p-4 rounded-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-slate-600 text-sm">
            {preferences.purpose ? getDescription() : 'Select your preferences to get started'}
          </p>
          <div className="flex gap-2">
            {getRelevantCreators().map((creator) => (
              <CreatorTag 
                key={creator.id}
                name={creator.name}
                isLiked={subscribedCreators.has(creator.id)}
                onToggleLike={() => onSubscribe(creator.id)}
              />
            ))}
          </div>
        </div>
        
        <button 
          onClick={onEdit}
          className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 
                   hover:bg-white/50 rounded-lg transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default PreferenceSummary; 