import React, { useState } from 'react';
import * as Patterns from './patterns';
import PatternContainer from './components/PatternContainer';
import { Info } from 'lucide-react';

function Demo() {
  const [selectedPatterns, setSelectedPatterns] = useState([]);
  const [infoPattern, setInfoPattern] = useState(null);
  
  // All available patterns from our library
  const allPatterns = Object.entries(Patterns)
    .filter(([_, pattern]) => pattern && typeof pattern === 'function')
    .map(([name, pattern]) => ({
      id: name,
      component: pattern,
      metadata: pattern.metadata || {
        title: name,
        description: "Interface pattern",
        category: "general"
      },
      example: pattern.Example
    }));
  
  // Group patterns by category
  const patternsByCategory = allPatterns.reduce((acc, pattern) => {
    const category = pattern.metadata?.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(pattern);
    return acc;
  }, {});
  
  const togglePattern = (patternId) => {
    setSelectedPatterns(prev => {
      if (prev.includes(patternId)) {
        return prev.filter(id => id !== patternId);
      } else {
        return [...prev, patternId];
      }
    });
  };
  
  // Toggle the info panel for a pattern
  const toggleInfo = (pattern, e) => {
    e.stopPropagation(); // Prevent toggling selection
    setInfoPattern(infoPattern?.id === pattern.id ? null : pattern);
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="min-h-screen flex">
        {/* Main Content Area - Shows selected patterns */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-medium mb-8">Interface Patterns</h1>
            
            {selectedPatterns.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <p className="text-slate-600 text-lg">
                  Select patterns from the sidebar to see them in action
                </p>
              </div>
            ) : (
              <div className="grid gap-8">
                {selectedPatterns.map(patternId => {
                  const pattern = allPatterns.find(p => p.id === patternId);
                  if (!pattern) return null;
                  
                  return (
                    <PatternContainer
                      key={patternId}
                      pattern={pattern.component}
                      metadata={pattern.metadata}
                      example={pattern.example}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Sidebar - Pattern Selection */}
        <div className="w-80 bg-white shadow-sm overflow-y-auto p-4 flex-shrink-0">
          <h2 className="text-lg font-medium mb-4">Available Patterns</h2>
          
          {Object.entries(patternsByCategory).map(([category, patterns]) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                {category}
              </h3>
              
              <div className="space-y-2">
                {patterns.map(pattern => (
                  <button
                    key={pattern.id}
                    onClick={() => togglePattern(pattern.id)}
                    className={`
                      w-full text-left p-3 rounded-lg transition-all relative
                      ${selectedPatterns.includes(pattern.id) 
                        ? 'bg-emerald-50 border border-emerald-200' 
                        : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
                      }
                    `}
                  >
                    <div className="font-medium pr-8">{pattern.metadata.title}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      {pattern.metadata.description}
                    </div>
                    <button 
                      onClick={(e) => toggleInfo(pattern, e)}
                      className="absolute right-2 top-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Show pattern information"
                    >
                      <Info size={18} />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Pattern Info Modal */}
        {infoPattern && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" 
               onClick={() => setInfoPattern(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 overflow-hidden" 
                 onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <h2 className="text-xl font-medium">{infoPattern.metadata.title}</h2>
                <p className="mt-2 text-slate-600">{infoPattern.metadata.description}</p>
              </div>
              <div className="bg-slate-50 p-6 border-t">
                <h3 className="text-sm font-medium text-slate-500 uppercase mb-3">Pattern Example</h3>
                <div className="bg-white p-4 rounded-lg">
                  {infoPattern.example ? 
                    <infoPattern.example /> : 
                    <infoPattern.component />
                  }
                </div>
              </div>
              <div className="p-4 bg-white border-t flex justify-end">
                <button 
                  onClick={() => setInfoPattern(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Demo;