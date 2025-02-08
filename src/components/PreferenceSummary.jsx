import React from 'react';

const CreatorTag = ({ name, isLiked }) => (
  <div className="inline-flex items-center px-3 py-1 bg-white/80 backdrop-blur-sm 
                  rounded-full text-sm text-slate-700 shadow-sm">
    {name}
    {isLiked && <span className="ml-1.5">❤️</span>}
  </div>
);

const PreferenceSummary = ({ preferences, creators, onEdit }) => {
  // Generate description based on preferences
  const getDescription = () => {
    const purpose = preferences.purpose;
    const styles = Array.from(preferences.style).join(' and ');
    return `A ${styles.toLowerCase()} interface designed for ${purpose.toLowerCase()}, combining the best elements for your workflow.`;
  };

  // Determine which creators to show based on preferences
  const getRelevantCreators = () => {
    const creatorTags = [];
    
    if (preferences.style.has('Minimalist')) {
      creatorTags.push({ name: "Zen by Jun Tanaka" });
    }
    if (preferences.style.has('Professional')) {
      creatorTags.push({ name: "Connectivity by Marcus Chen", isLiked: true });
    }
    if (preferences.style.has('Creative')) {
      creatorTags.push({ name: "Creative Flow by Luna Martinez" });
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
            {getRelevantCreators().map((creator, index) => (
              <CreatorTag 
                key={index}
                name={creator.name}
                isLiked={creator.isLiked}
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