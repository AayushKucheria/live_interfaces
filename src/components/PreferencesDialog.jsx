import React, { useState, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { generateModeLabels } from '../services/interfaceGenerator';

const QuickButton = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-6 py-4 rounded-lg text-sm font-medium transition-all duration-300
      min-h-[80px] w-full flex items-center justify-center
      ${selected 
        ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500' 
        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
      }
    `}
  >
    <span className="text-center transition-opacity duration-300 leading-relaxed">
      {label}
    </span>
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

const modeVariations = {
  reflection: [
    "Let's process how you're feeling",
    "Take a mindful pause",
    "Find clarity in this moment",
    "Gentle space to reflect",
    "Unwind your thoughts"
  ],
  planning: [
    "Small steps forward",
    "Let's break this down",
    "Find your next move",
    "Shape your path ahead",
    "Organize with ease"
  ],
  capture: [
    "Just get it down",
    "Quick thoughts, no pressure",
    "Save it for later",
    "Let it flow freely",
    "Catch those ideas"
  ]
};

const PreferencesDialog = ({ onComplete }) => {
  const [preferences, setPreferences] = useState({
    intention: '',
    mode: '',
    creators: new Set(),
    modeLabels: {
      reflection: "Reflection",
      planning: "Planning",
      capture: "Quick Capture"
    }
  });

  const creators = [
    { id: 'minimalist', name: 'Minimalism', creator: 'jun' },
    { id: 'creative', name: 'Creative Flow', creator: 'luna' },
    { id: 'structured', name: 'Knowledge Architecture', creator: 'marcus' }
  ];

  useEffect(() => {
    const processIntention = debounce(async (text) => {
      if (text.length < 15) return;

      try {
        const aiLabels = await generateModeLabels(text);
        if (aiLabels) {
          setPreferences(prev => ({
            ...prev,
            modeLabels: aiLabels
          }));
        }
      } catch (error) {
        console.error('Error generating AI labels:', error);
      }
    }, 600);

    processIntention(preferences.intention);
    return () => processIntention.cancel();
  }, [preferences.intention]);

  const modes = [
    { id: 'reflection', label: preferences.modeLabels.reflection },
    { id: 'planning', label: preferences.modeLabels.planning },
    { id: 'capture', label: preferences.modeLabels.capture }
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
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl p-12 m-4">
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-medium text-slate-800">
              Plant the seed of your idea
            </h2>
            <p className="text-slate-600 text-lg">
              We'll grow an interface that resonates with your intention, combining elements from our creators' gardens.
            </p>
          </div>

          <div className="flex gap-10">
            <div className="flex-1">
              <div className="bg-slate-50/70 p-8 rounded-2xl">
                <textarea
                  value={preferences.intention}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    intention: e.target.value
                  }))}
                  placeholder="What's on your mind? How are you feeling? Let's find the right space for your thoughts..."
                  className="w-full h-40 p-6 text-lg bg-white rounded-xl 
                           border-none focus:ring-2 focus:ring-emerald-500
                           placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 min-w-[320px]">
              {modes.map(({ id, label }) => (
                <QuickButton
                  key={id}
                  label={label}
                  selected={preferences.mode === id}
                  onClick={() => setPreferences(prev => ({
                    ...prev,
                    mode: id
                  }))}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
            <p className="text-slate-600 mb-4">Choose your garden's style:</p>
            <div className="flex items-center gap-3">
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
                className="p-3 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                onClick={() => {/* Add new creator logic */}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-emerald-500 text-white text-lg rounded-xl
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