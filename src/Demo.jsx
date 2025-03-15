// Copy the entire Demo component code from the artifact here
// The code is quite long so I'm not repeating it, but it's the same as in the artifact

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { PenTool, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCreators } from './services/creatorStorage';
import { saveAs } from 'file-saver'; // Import file-saver for easier file downloads

const purposes = {
  planning: {
    title: "Planning",
    description: "Plan your notes"
  },
  capture: {
    title: "Quick Capture",
    description: "Quickly capture notes"
  },
  reflection: {
    title: "Reflection", 
    description: "Reflect on your notes"
  }
};

// Simple encouraging messages
const encouragements = [
  "Keep going...",
  "Looking good...",
  "Nice progress...",
  "Keep it up...",
  "Doing well..."
];

const OptionBubble = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-6 py-2 rounded-full text-sm transition-all
      ${selected 
        ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500' 
        : 'bg-slate-50 hover:bg-slate-100'
      }
    `}
  >
    {label}
  </button>
);

const CreatorBubble = ({ creator, name, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-6 py-2 rounded-full text-sm transition-all
      ${selected 
        ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500' 
        : 'bg-slate-50 hover:bg-slate-100'
      }
    `}
  >
    <div className="text-center">
      <div>{creator.vibe}</div>
      <div className="text-xs text-slate-500 mt-1">by {name}</div>
    </div>
  </button>
);

const getRandomEncouragement = () => {
  return encouragements[Math.floor(Math.random() * encouragements.length)];
};

const combineFeatures = (creators, selectedCreator, selectedAesthetics) => {
  if (!creators || !creators[selectedCreator]) {
    return {};
  }

  const features = { ...creators[selectedCreator].features }; // Start with base features
  
  Object.values(creators).forEach(creator => {
    if (creator.style?.aesthetics) {
      creator.style.aesthetics.forEach(aesthetic => {
        if (selectedAesthetics.has(aesthetic.id)) {
          aesthetic.features?.forEach(feature => {
            features[feature] = true;
          });
        }
      });
    }
  });
  
  return features;
};

const NoteInterface = ({ creatorId, purpose, selectedAesthetics, creators, additionalContext }) => {
  const [entries, setEntries] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [encouragement, setEncouragement] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const creator = creators[creatorId];
  if (!creator) {
    return <div>Loading...</div>;
  }

  // Add effect to show transition when creator changes
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [creatorId]);

  const combinedFeatures = combineFeatures(creators, creatorId, selectedAesthetics);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      let newEntry = {
        text: currentInput,
        bullet: combinedFeatures.randomBullets 
          ? creator.features.randomBullets[
              Math.floor(Math.random() * creator.features.randomBullets.length)
            ]
          : creator.style.bullet,
        tags: combinedFeatures.autoTags 
          ? extractTags(currentInput)
          : []
      };

      setEntries([...entries, newEntry]);
      setCurrentInput('');
      
      if (creator.features?.showEncouragement) {
        setEncouragement(getRandomEncouragement());
      }
    }
  };

  // Simple tag extraction - could be made more sophisticated
  const extractTags = (text) => {
    const commonKeywords = ['task', 'idea', 'question', 'important', 'later'];
    return commonKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );
  };

  // Render the causal loop visualization when Jun's style is selected
  const renderCausalLoopVisualization = () => {
    if (creatorId !== 'jun' || !creator.features?.causalModel || !combinedFeatures.showRelationships) {
      return null;
    }

    const { objects, morphisms } = creator.features.causalModel;

    return (
      <div className={creator.style.networkGraph}>
        <h3 className="text-sm font-medium text-slate-700 mb-3">Causal Loop Visualization</h3>
        <div className="relative h-40 border border-blue-100 rounded-lg bg-white p-4">
          {/* Wolves node at top */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 px-3 py-1 rounded text-blue-800 font-medium">
            {objects[0].name}
          </div>
          
          {/* Chickens node at bottom */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 px-3 py-1 rounded text-yellow-800 font-medium">
            {objects[1].name}
          </div>
          
          {/* Arrow from wolves to chickens */}
          <div className="absolute top-[40px] left-1/3 transform rotate-135 text-red-500 font-bold">
            ↓
            <span className="absolute left-4 top-0 text-xs text-red-600 whitespace-nowrap">
              {morphisms[0].type}
            </span>
          </div>
          
          {/* Arrow from chickens to wolves */}
          <div className="absolute bottom-[40px] right-1/3 transform rotate-45 text-green-500 font-bold">
            ↑
            <span className="absolute right-4 bottom-0 text-xs text-green-600 whitespace-nowrap">
              {morphisms[1].type}
            </span>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-slate-500">
          <p>This visualization represents a predator-prey relationship in a causal loop.</p>
          <p className="mt-1">Theory: {creator.features.modelData.theory}</p>
        </div>
      </div>
    );
  };

  // Render the extended causal network visualization when Marcus's style is selected
  const renderComplexNetworkVisualization = () => {
    if (creatorId !== 'marcus' || !creator.features?.causalModel || !combinedFeatures.showComplexNetwork) {
      return null;
    }

    const { objects, morphisms } = creator.features.causalModel;

    return (
      <div className={creator.style.networkGraph}>
        <h3 className="text-sm font-medium text-indigo-700 mb-3">Extended Causal Network</h3>
        <div className="relative h-64 border border-indigo-100 rounded-lg bg-white p-4">
          {/* Wolves node at top */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-indigo-100 px-3 py-1 rounded text-indigo-800 font-medium">
            {objects[0].name}
          </div>
          
          {/* Chickens node in middle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-100 px-3 py-1 rounded text-yellow-800 font-medium">
            {objects[1].name}
          </div>
          
          {/* Worms node at bottom */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-100 px-3 py-1 rounded text-green-800 font-medium">
            {objects[2].name}
          </div>
          
          {/* Arrow from wolves to chickens */}
          <div className="absolute top-[30px] left-1/3 transform rotate-135 text-red-500 font-bold">
            ↓
            <span className="absolute left-4 top-0 text-xs text-red-600 whitespace-nowrap">
              {morphisms[0].type}
            </span>
          </div>
          
          {/* Arrow from chickens to wolves */}
          <div className="absolute top-[60px] right-1/3 transform rotate-45 text-green-500 font-bold">
            ↑
            <span className="absolute right-4 top-0 text-xs text-green-600 whitespace-nowrap">
              {morphisms[1].type}
            </span>
          </div>
          
          {/* Arrow from chickens to worms */}
          <div className="absolute bottom-[90px] left-1/3 transform rotate-135 text-red-500 font-bold">
            ↓
            <span className="absolute left-4 bottom-0 text-xs text-red-600 whitespace-nowrap">
              {morphisms[2].type}
            </span>
          </div>
          
          {/* Arrow from worms to chickens */}
          <div className="absolute bottom-[60px] right-1/3 transform rotate-45 text-green-500 font-bold">
            ↑
            <span className="absolute right-4 bottom-0 text-xs text-green-600 whitespace-nowrap">
              {morphisms[3].type}
            </span>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-indigo-500">
          <p>This visualization represents a complete ecosystem with multiple predator-prey relationships.</p>
          <p className="mt-1">Theory: {creator.features.modelData.theory}</p>
        </div>
      </div>
    );
  };

  // Render the creative ecosystem visualization when Luna's style is selected
  const renderCreativeEcosystemVisualization = () => {
    if (creatorId !== 'luna' || !creator.features?.causalModel || !combinedFeatures.showCreativeEcosystem) {
      return null;
    }

    const { objects, morphisms } = creator.features.causalModel;

    return (
      <div className={creator.style.networkGraph}>
        <h3 className="text-sm font-medium text-purple-700 mb-3">Creative Ecosystem Map</h3>
        <div className="relative h-64 border border-purple-100 rounded-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-4">
          {/* Circular arrangement of nodes */}
          <div className="absolute w-full h-full flex items-center justify-center">
            {/* Central container for visual arrangement */}
            <div className="relative w-48 h-48">
              {/* Wolves node at top-left */}
              <div className="absolute top-0 left-0 bg-purple-100 px-3 py-1 rounded-full text-purple-800 font-medium shadow-sm">
                {objects[0].name}
              </div>
              
              {/* Chickens node at top-right */}
              <div className="absolute top-0 right-0 bg-pink-100 px-3 py-1 rounded-full text-pink-800 font-medium shadow-sm">
                {objects[1].name}
              </div>
              
              {/* Worms node at bottom */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-blue-100 px-3 py-1 rounded-full text-blue-800 font-medium shadow-sm">
                {objects[2].name}
              </div>

              {/* Connection lines with animations */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Wolf to Chicken (negative) */}
                <path 
                  d="M 40,20 L 110,20" 
                  stroke="#f87171" 
                  strokeWidth="2" 
                  fill="none"
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />
                <text x="70" y="15" fontSize="10" fill="#ef4444" textAnchor="middle">−</text>
                
                {/* Chicken to Wolf (positive) */}
                <path 
                  d="M 110,30 L 40,30" 
                  stroke="#22c55e" 
                  strokeWidth="2" 
                  fill="none"
                />
                <text x="70" y="45" fontSize="10" fill="#16a34a" textAnchor="middle">+</text>
                
                {/* Chicken to Worm (negative) */}
                <path 
                  d="M 120,40 L 90,120" 
                  stroke="#f87171" 
                  strokeWidth="2" 
                  fill="none"
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />
                <text x="115" y="90" fontSize="10" fill="#ef4444" textAnchor="middle">−</text>
                
                {/* Worm to Chicken (positive) */}
                <path 
                  d="M 100,110 L 130,40" 
                  stroke="#22c55e" 
                  strokeWidth="2" 
                  fill="none"
                />
                <text x="125" y="70" fontSize="10" fill="#16a34a" textAnchor="middle">+</text>
                
                {/* Worm to Wolf (negative) - the new relationship */}
                <path 
                  d="M 60,120 L 30,40" 
                  stroke="#f87171" 
                  strokeWidth="2" 
                  fill="none"
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />
                <text x="35" y="80" fontSize="10" fill="#ef4444" textAnchor="middle">−</text>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-purple-500">
          <p>This creative map shows a complex ecosystem with parasitic worms affecting both chickens and wolves.</p>
          <p className="mt-1 italic">Five relationships balance this delicate system.</p>
        </div>
      </div>
    );
  };

  const renderEntry = (entry, idx) => {
    // Handle Jun's single entry display
    if (creatorId === 'jun' && creator.features.showOneAtTime) {
      const isLatest = idx === entries.length - 1;
      if (!isLatest) return null;
    }

    return (
      <div 
        key={idx} 
        className={creator.style.entry}
        style={{
          opacity: creator.features?.fadeOldEntries 
            ? idx === entries.length - 1 ? 1 : 0.5 
            : 1
        }}
      >
        <span className="text-slate-400">{entry.bullet}</span>
        <div className="flex-1">
          <span className={creator.style.entryText}>{entry.text}</span>
          {entry.tags?.length > 0 && (
            <div className="mt-1">
              {entry.tags.map((tag, tagIdx) => (
                <span key={tagIdx} className={creator.style.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          {creator.features?.showConnections && idx > 0 && (
            <div className={creator.style.connection}>
              connects to thought {idx}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`${creator.style.container} transition-all duration-300`}
      style={{
        opacity: isTransitioning ? 0.5 : 1,
        transform: isTransitioning ? 'scale(0.98)' : 'scale(1)'
      }}
    >
      <input
        type="text"
        value={currentInput}
        onChange={(e) => setCurrentInput(e.target.value)}
        placeholder="Start typing..."
        className={creator.style.input}
        onKeyPress={handleKeyPress}
      />
      
      {creator.features?.showEncouragement && encouragement && (
        <div className={creator.style.encouragement}>
          {encouragement}
        </div>
      )}

      <div className="mt-4">
        {renderCausalLoopVisualization()}
        {renderComplexNetworkVisualization()}
        {renderCreativeEcosystemVisualization()}
        {entries.map((entry, idx) => renderEntry(entry, idx))}
      </div>
    </div>
  );
};

const PurposeSelector = ({ selected, onSelect }) => (
  <div className="w-full max-w-2xl mx-auto">
    <div className="text-slate-600 mb-2 text-lg">
      What do you want to think about today?
    </div>
    <div className="flex space-x-3">
      {Object.entries(purposes).map(([id, purpose]) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`
            px-5 py-2 rounded-full text-sm transition-all
            ${selected === id 
              ? 'bg-emerald-100 text-emerald-900' 
              : 'bg-white hover:bg-slate-50'
            }
          `}
        >
          {purpose.title}
        </button>
      ))}
    </div>
  </div>
);

// Simple card styles
const cardStyles = {
  jun: {
    background: `bg-blue-50 bg-[linear-gradient(135deg,rgba(255,255,255,0.5)_21px,transparent_22px)]`,
    aesthetics: [
      { 
        id: 'minimal', 
        label: 'Causal View',
        color: 'bg-blue-100 text-blue-800',
        features: ['fadeOldEntries', 'showRelationships']
      },
      { 
        id: 'zen', 
        label: 'Graph Mode',
        color: 'bg-indigo-100 text-indigo-800',
        features: ['showOneAtTime', 'showCausalGraph']
      }
    ]
  },
  luna: {
    background: 'bg-gradient-to-br from-purple-50 to-pink-50 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_25%,rgba(255,255,255,0.4)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.4)_75%)] bg-[length:10px_10px]',
    aesthetics: [
      { 
        id: 'encouraging', 
        label: 'Creative Ecosystem',
        color: 'bg-purple-100 text-purple-800',
        features: ['showCreativeEcosystem', 'showEncouragement']
      },
      { 
        id: 'playful', 
        label: 'Visual Flow',
        color: 'bg-pink-100 text-pink-800',
        features: ['playfulAnimations', 'showConnections']
      }
    ]
  },
  marcus: {
    background: 'bg-indigo-50 bg-[radial-gradient(circle,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:20px_20px]',
    aesthetics: [
      { 
        id: 'organized', 
        label: 'Network View',
        color: 'bg-indigo-100 text-indigo-800',
        features: ['showComplexNetwork', 'autoTags']
      },
      { 
        id: 'systematic', 
        label: 'Detailed Analysis',
        color: 'bg-purple-100 text-purple-800',
        features: ['showConnections', 'showCategories']
      }
    ]
  }
};

// Simplified creator card
const CreatorCard = ({ 
  creator, 
  id, 
  selected, 
  onSelect, 
  isSubscribed,
  onSubscribe,
  selectedAesthetics, 
  onAestheticToggle 
}) => {
  const style = cardStyles[id] || cardStyles.default;

  const handleSubscribe = (e) => {
    e.stopPropagation();
    onSubscribe(id);
  };

  return (
    <div className="relative group">
      <div
        onClick={() => onSelect(id)}
        className={`
          w-full p-4 rounded-xl text-left transition-all cursor-pointer
          ${style.background}
          ${selected 
            ? 'ring-2 ring-emerald-500 shadow-lg' 
            : 'hover:shadow-md'
          }
        `}
      >
        <div>
          <div className="font-medium mb-4">{creator.vibe}</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                by {creator.name}
              </span>
              <button 
                onClick={handleSubscribe}
                className="p-1 hover:bg-white/50 rounded-full transition-colors"
              >
                {isSubscribed ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-2 ml-2">
        {style.aesthetics.map(aesthetic => (
          <button
            key={aesthetic.id}
            onClick={(e) => {
              e.stopPropagation();
              onAestheticToggle(aesthetic.id);
            }}
            className={`
              px-3 py-1 rounded-full text-xs
              ${aesthetic.color}
              ${selectedAesthetics.has(aesthetic.id) 
                ? 'ring-2 ring-slate-500' 
                : 'hover:opacity-90'
              }
              transition-all cursor-pointer
            `}
          >
            {aesthetic.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const CreatorSidebar = ({ 
  creators,
  selected, 
  onSelect, 
  selectedAesthetics, 
  onAestheticToggle,
  isCollapsed,
  onToggle,
  subscribedCreators,
  onSubscribe
}) => (
  <div 
    className={`
      relative flex-shrink-0
      transition-all duration-300 ease-in-out
      h-full
      ${isCollapsed ? 'w-12' : 'w-80'}
    `}
  >
    {/* Toggle Button */}
    <button
      onClick={onToggle}
      className="absolute -left-3 top-1/2 transform -translate-y-1/2
               w-6 h-12 bg-white rounded-l-lg shadow-md
               flex items-center justify-center
               hover:bg-slate-50 transition-colors z-10"
    >
      {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>

    {/* Sidebar Content Container */}
    <div className="h-full bg-white rounded-l-xl shadow-sm">
      <div className={`
        h-full overflow-y-auto
        ${isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'}
        transition-all duration-200
        space-y-6 p-4
      `}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-700">Choose Style</h2>
        </div>
        <div className="space-y-6">
          {Object.entries(creators).map(([id, creator]) => (
            <CreatorCard
              key={id}
              id={id}
              creator={creator}
              selected={selected === id}
              onSelect={onSelect}
              selectedAesthetics={selectedAesthetics}
              onAestheticToggle={onAestheticToggle}
              isSubscribed={subscribedCreators.has(id)}
              onSubscribe={onSubscribe}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Demo = () => {
  const [selectedPurpose, setSelectedPurpose] = useState('capture');
  const [selectedCreator, setSelectedCreator] = useState('luna');
  const [selectedAesthetics, setSelectedAesthetics] = useState(new Set(['playful', 'colorful']));
  const [creators, setCreators] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Start collapsed
  const [preferences, setPreferences] = useState({
    purpose: 'quick capture',
    style: new Set(['creative']), // Initialize with creative style
    additionalContext: ''
  });
  const [subscribedCreators, setSubscribedCreators] = useState(new Set());

  useEffect(() => {
    const loadCreators = async () => {
      try {
        setIsLoading(true);
        const loadedCreators = await getCreators();
        setCreators(loadedCreators);
      } catch (error) {
        console.error('Failed to load creators:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCreators();
  }, []);

  const handleAestheticToggle = (aestheticId) => {
    setSelectedAesthetics(prev => {
      const next = new Set(prev);
      if (next.has(aestheticId)) {
        next.delete(aestheticId);
      } else {
        next.add(aestheticId);
      }
      return next;
    });
  };

  const handleSubscribe = (creatorId) => {
    setSubscribedCreators(prev => {
      const next = new Set(prev);
      if (next.has(creatorId)) {
        next.delete(creatorId);
      } else {
        next.add(creatorId);
      }
      return next;
    });
  };

  const handleDownload = () => {
    // Get only the selected creator
    const selectedCreatorData = creators[selectedCreator];
    
    if (!selectedCreatorData) {
      console.error('Selected creator not found');
      return;
    }
    
    // Create a filtered aesthetics collection that only includes selected ones
    const filteredAesthetics = [];
    
    // Check if the creator has aesthetics defined
    if (selectedCreatorData.style?.aesthetics) {
      // Filter only the selected aesthetics
      selectedCreatorData.style.aesthetics.forEach(aesthetic => {
        if (selectedAesthetics.has(aesthetic.id)) {
          filteredAesthetics.push(aesthetic);
        }
      });
    }
    
    // Filter cardStyles information (from the styling)
    const selectedCardStyle = cardStyles[selectedCreator] || {};
    
    // Create a streamlined export with only the active components
    const dataToDownload = {
      activeInterface: {
        creator: {
          id: selectedCreator,
          name: selectedCreatorData.name,
          vibe: selectedCreatorData.vibe,
          style: {
            ...selectedCreatorData.style,
            aesthetics: filteredAesthetics
          },
          features: selectedCreatorData.features
        },
        purpose: selectedPurpose,
        preferences: {
          additionalContext: preferences.additionalContext,
          purpose: preferences.purpose,
          style: Array.from(preferences.style)
        },
        styling: selectedCardStyle
      }
    };

    // Convert data to JSON
    const jsonString = JSON.stringify(dataToDownload, null, 2);

    // Create a Blob and use file-saver to trigger download
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, `note-taking-interface-${selectedCreator}.json`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="min-h-screen flex flex-col">
        {/* Add decorative blurred elements */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-50/50 to-transparent pointer-events-none" />

        {/* Add vertical padding to create breathing space */}
        <div className="flex-1 flex flex-col py-12">
          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden px-6">
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-8 h-full">
                <NoteInterface 
                  creatorId={selectedCreator}
                  purpose={selectedPurpose}
                  selectedAesthetics={selectedAesthetics}
                  creators={creators}
                  additionalContext={preferences.additionalContext}
                />
              </div>
            </div>

            <CreatorSidebar
              creators={creators}
              selected={selectedCreator}
              onSelect={setSelectedCreator}
              selectedAesthetics={selectedAesthetics}
              onAestheticToggle={handleAestheticToggle}
              isCollapsed={isSidebarCollapsed}
              onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              subscribedCreators={subscribedCreators}
              onSubscribe={handleSubscribe}
            />
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-center mb-4">
          <button 
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default Demo;