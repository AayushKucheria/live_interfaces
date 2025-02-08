// Copy the entire Demo component code from the artifact here
// The code is quite long so I'm not repeating it, but it's the same as in the artifact

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { PenTool, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCreators } from './services/creatorStorage';
import PreferencesDialog from './components/PreferencesDialog';
import PreferenceSummary from './components/PreferenceSummary';

const purposes = {
  planning: {
    title: "Planning",
    description: "Step by step, map out what lies ahead"
  },
  capture: {
    title: "Quick Capture",
    description: "Let thoughts flow freely as they come"
  },
  reflection: {
    title: "Reflection", 
    description: "Take a moment to look back and process"
  }
};

// Encouraging messages for Luna's interface
const encouragements = [
  "Your ideas are flowing beautifully...",
  "What a wonderful thought! Keep going...",
  "Your creativity is shining through...",
  "I love where this is heading...",
  "You're on an inspiring path..."
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

// First, let's add the Excalidraw links to the cardStyles object
const cardStyles = {
  jun: {
    background: `bg-slate-50 [background-image:linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%,#f1f5f9)] bg-[length:16px_16px]`,
    excalidrawLink: "https://link.excalidraw.com/readonly/qa5o7F4gD0qC5gNHm4Qu",
    aesthetics: [
      { 
        id: 'minimal', 
        label: 'Minimalist Interface',
        color: 'bg-slate-100 text-slate-700',
        features: ['fadeOldEntries', 'showOneAtTime']
      },
      { 
        id: 'zen', 
        label: 'Zen Transitions',
        color: 'bg-slate-100 text-slate-700',
        features: ['gentleAnimations']
      }
    ]
  },
  luna: {
    background: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    excalidrawLink: "https://link.excalidraw.com/readonly/AQRMgvNGJdadf6QQUSV6",
    aesthetics: [
      { 
        id: 'encouraging', 
        label: 'Encouragement System',
        color: 'bg-yellow-100 text-yellow-800',
        features: ['showEncouragement']
      },
      { 
        id: 'playful', 
        label: 'Playful Elements',
        color: 'bg-orange-100 text-orange-800',
        features: ['playfulAnimations', 'randomBullets']
      }
    ]
  },
  marcus: {
    background: 'bg-blue-50 [background-image:linear-gradient(white_2px,transparent_2px),linear-gradient(90deg,white_2px,transparent_2px)] bg-[size:32px_32px]',
    excalidrawLink: "https://link.excalidraw.com/readonly/amYLJLNZ4z3sLqJynrAW",
    aesthetics: [
      { 
        id: 'organized', 
        label: 'Smart Organization',
        color: 'bg-blue-100 text-blue-800',
        features: ['autoTags']
      },
      { 
        id: 'systematic', 
        label: 'Thought Connections',
        color: 'bg-indigo-100 text-indigo-800',
        features: ['showConnections', 'systemicLayout']
      }
    ]
  }
};

// Then update the CreatorCard component to handle the artifact click
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

  const handleArtifactClick = (e) => {
    e.stopPropagation();
    if (style.excalidrawLink) {
      window.open(style.excalidrawLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative group">
      <div
        onClick={() => onSelect(id)}
        className={`
          w-full p-4 rounded-xl text-left transition-all cursor-pointer
          ${style.background}
          ${selected 
            ? 'ring-2 ring-emerald-500 shadow-lg scale-[1.02] transition-transform' 
            : 'hover:shadow-md hover:scale-[1.01] transition-transform'
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
            
            <button 
              onClick={handleArtifactClick}
              className="text-xs px-2 py-1 bg-white/80 backdrop-blur-sm 
                text-slate-600 rounded-md opacity-0 group-hover:opacity-100 
                transition-opacity hover:bg-white/90"
            >
              Show Artifacts
            </button>
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
                ? 'ring-2 ring-offset-2 ring-slate-500 shadow-sm' 
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
  navigate,
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
          <button 
            onClick={() => navigate('/become-creator')}
            className="px-3 py-1 text-sm bg-emerald-50 text-emerald-700 rounded-full 
                     hover:bg-emerald-100 transition-colors"
          >
            Become a Creator
          </button>
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
  const [selectedAesthetics, setSelectedAesthetics] = useState(new Set());
  const [creators, setCreators] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [showPreferences, setShowPreferences] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Start collapsed
  const [preferences, setPreferences] = useState({
    purpose: '',
    style: new Set(), // Initialize with empty Set
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

  const handlePreferencesComplete = (newPreferences) => {
    setPreferences(newPreferences);

    // Map mode to purpose
    const purposeMap = {
      'quick capture': 'capture',
      'reflection': 'reflection',
      'planning': 'planning'
    };
    setSelectedPurpose(purposeMap[newPreferences.purpose] || 'capture');

    // Set creator based on style preferences
    if (newPreferences.style.has('minimalist')) {
      setSelectedCreator('jun');
    } else if (newPreferences.style.has('creative')) {
      setSelectedCreator('luna');
    } else if (newPreferences.style.has('structured')) {
      setSelectedCreator('marcus');
    }

    // Set aesthetics based on selected creators
    const newAesthetics = new Set();
    if (newPreferences.style.has('minimalist')) {
      newAesthetics.add('zen');
      newAesthetics.add('clean');
    }
    if (newPreferences.style.has('creative')) {
      newAesthetics.add('playful');
      newAesthetics.add('colorful');
    }
    if (newPreferences.style.has('structured')) {
      newAesthetics.add('organized');
      newAesthetics.add('professional');
    }
    setSelectedAesthetics(newAesthetics);

    setShowPreferences(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {showPreferences && (
        <PreferencesDialog onComplete={handlePreferencesComplete} />
      )}
      <div className={`h-screen flex flex-col ${showPreferences ? 'blur-sm' : ''}`}>
        <div className="px-6 pt-6">
          <div className="max-w-6xl mx-auto">
            <PreferenceSummary 
              preferences={preferences}
              subscribedCreators={subscribedCreators}
              onSubscribe={handleSubscribe}
              onEdit={() => setShowPreferences(true)}
            />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden px-6 pt-6">
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="bg-white rounded-xl shadow-sm p-6 h-full">
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
            navigate={navigate}
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            subscribedCreators={subscribedCreators}
            onSubscribe={handleSubscribe}
          />
        </div>
      </div>
    </div>
  );
};

export default Demo;