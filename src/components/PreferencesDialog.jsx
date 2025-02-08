import React, { useState } from 'react';

const PreferenceOption = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-full text-sm transition-all
      ${selected 
        ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500' 
        : 'bg-white hover:bg-slate-50 text-slate-700'
      }
    `}
  >
    {label}
  </button>
);

const PreferencesDialog = ({ onComplete }) => {
  const [preferences, setPreferences] = useState({
    purpose: '',
    style: new Set(),
    additionalContext: ''
  });

  const purposes = [
    'Quick Notes',
    'Deep Thinking',
    'Task Planning'
  ];

  const styles = [
    'Minimalist',
    'Creative',
    'Professional',
    'Playful'
  ];

  const handleSave = () => {
    onComplete(preferences);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 m-4">
        <h2 className="text-2xl font-medium text-slate-800 mb-6">
          Tell us about yourself
        </h2>

        <div className="space-y-6">
          {/* Purpose Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              What brings you here today?
            </label>
            <div className="flex flex-wrap gap-2">
              {purposes.map(purpose => (
                <PreferenceOption
                  key={purpose}
                  label={purpose}
                  selected={preferences.purpose === purpose}
                  onClick={() => setPreferences(prev => ({
                    ...prev,
                    purpose: purpose
                  }))}
                />
              ))}
            </div>
          </div>

          {/* Style Preferences */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Select your preferred styles
            </label>
            <div className="flex flex-wrap gap-2">
              {styles.map(style => (
                <PreferenceOption
                  key={style}
                  label={style}
                  selected={preferences.style.has(style)}
                  onClick={() => setPreferences(prev => {
                    const newStyle = new Set(prev.style);
                    if (newStyle.has(style)) {
                      newStyle.delete(style);
                    } else {
                      newStyle.add(style);
                    }
                    return { ...prev, style: newStyle };
                  })}
                />
              ))}
            </div>
          </div>

          {/* Additional Context */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Anything else you'd like to tell us? (optional)
            </label>
            <textarea
              value={preferences.additionalContext}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                additionalContext: e.target.value
              }))}
              placeholder="Share any specific preferences or requirements..."
              className="w-full h-24 p-3 text-sm bg-slate-50 rounded-lg 
                       border-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg
                     hover:bg-emerald-600 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesDialog; 