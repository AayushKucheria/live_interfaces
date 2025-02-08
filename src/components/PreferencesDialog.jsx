import React, { useState } from 'react';

const QuickButton = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg text-sm font-medium transition-all
      ${selected 
        ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500' 
        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
      }
    `}
  >
    {label}
  </button>
);

const CreatorOption = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg text-sm transition-all
      ${selected 
        ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500' 
        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
      }
    `}
  >
    {label}
  </button>
);

const PreferencesDialog = ({ onComplete }) => {
  const [preferences, setPreferences] = useState({
    intention: '',
    mode: '',
    creators: new Set()
  });

  const modes = ['Reflection', 'Planning', 'Quick Capture'];
  const creators = [
    { id: 'minimalist', name: 'Minimalism', creator: 'jun' },
    { id: 'creative', name: 'Creative Flow', creator: 'luna' },
    { id: 'structured', name: 'Knowledge Architecture', creator: 'marcus' }
  ];

  const handleSave = () => {
    const mappedPreferences = {
      purpose: preferences.mode.toLowerCase(),
      style: preferences.creators,
      additionalContext: preferences.intention
    };
    onComplete(mappedPreferences);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-8 m-4">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-medium text-slate-800">
              Plant the seed of your idea
            </h2>
            <p className="text-slate-600 mt-2">
              We'll grow an interface that resonates with your intention, combining elements from our creators' gardens.
            </p>
          </div>

          {/* Main Input Area with Two Columns */}
          <div className="flex gap-6">
            {/* Left Column - Text Input */}
            <div className="flex-1">
              <div className="bg-slate-50 p-6 rounded-xl">
                <textarea
                  value={preferences.intention}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    intention: e.target.value
                  }))}
                  placeholder="What would help your thoughts flourish? Tell us about your moment, your purpose..."
                  className="w-full h-24 p-3 text-sm bg-white rounded-lg 
                           border-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Right Column - Quick Mode Selection */}
            <div className="flex flex-col gap-2 min-w-[140px]">
              {modes.map(mode => (
                <QuickButton
                  key={mode}
                  label={mode}
                  selected={preferences.mode === mode}
                  onClick={() => setPreferences(prev => ({
                    ...prev,
                    mode: mode
                  }))}
                />
              ))}
              <button 
                className="px-4 py-2 rounded-lg text-sm text-slate-400 border border-dashed border-slate-200 hover:border-slate-300 hover:text-slate-500"
              >
                ...
              </button>
            </div>
          </div>

          {/* Creator Options */}
          <div className="flex items-center gap-2">
            {creators.map(({ id, name }) => (
              <CreatorOption
                key={id}
                label={name}
                selected={preferences.creators.has(id)}
                onClick={() => setPreferences(prev => {
                  const newCreators = new Set(prev.creators);
                  if (newCreators.has(id)) {
                    newCreators.delete(id);
                  } else {
                    newCreators.add(id);
                  }
                  return { ...prev, creators: newCreators };
                })}
              />
            ))}
            
            <button 
              className="p-2 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              onClick={() => {/* Add new creator logic */}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg
                       hover:bg-emerald-600 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesDialog; 