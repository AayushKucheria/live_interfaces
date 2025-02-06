// Copy the entire Demo component code from the artifact here
// The code is quite long so I'm not repeating it, but it's the same as in the artifact

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { PenTool, Sparkles } from 'lucide-react';

const purposes = {
  planning: {
    title: "Planning",
    description: "Step by step, map out what lies ahead"
  },
  capture: {
    title: "Quick Capture",
    description: "Let thonughts flow freely as they come"
  },
  reflection: {
    title: "Reflection", 
    description: "Take a moment to look back and process"
  }
};

const creators = {
  jun: {
    name: "Jun Tanaka",
    vibe: "Digital Zen Garden",
    style: {
      container: "space-y-4 p-8 bg-gray-50",
      input: `w-full p-4 bg-transparent border-none focus:outline-none 
              text-gray-800 text-lg font-serif placeholder:text-gray-400
              transition-all duration-500`,
      entry: `flex items-start space-x-4 py-3 opacity-0 transform translate-y-4
              animate-slideIn`,
      bullet: "•",
      entryText: "font-serif text-gray-600",
      activeText: "text-gray-900",
      fadeText: "text-gray-400 transition-all duration-500"
    },
    features: {
      fadeOldEntries: true,
      showOneAtATime: true,
      gentleAnimations: true
    }
  },
  luna: {
    name: "Luna Martinez",
    vibe: "Your Creative Companion",
    style: {
      container: "space-y-4 p-6 bg-gradient-to-br from-purple-50 to-blue-50",
      input: `w-full p-4 rounded-xl bg-white/70 border-2 border-purple-200 
              focus:border-purple-400 focus:outline-none text-purple-700
              placeholder:text-purple-300`,
      entry: `flex items-start space-x-3 py-2 animate-bounceIn`,
      bullet: "✨",
      entryText: "text-purple-600",
      activeText: "text-purple-800",
      encouragement: "italic text-purple-400 text-sm mt-2"
    },
    features: {
      showEncouragement: true,
      playfulAnimations: true,
      randomBullets: ["✨", "🌟", "💫", "🎨", "🌸"]
    }
  },
  marcus: {
    name: "Marcus Chen",
    vibe: "Knowledge Architecture",
    style: {
      container: "space-y-2 p-6 bg-slate-50",
      input: `w-full p-3 bg-white border-b-2 border-slate-200 
              focus:border-slate-400 focus:outline-none font-mono`,
      entry: `flex items-start space-x-3 py-2`,
      bullet: "→",
      entryText: "font-mono text-slate-700",
      activeText: "text-slate-900",
      tag: `inline-block px-2 py-0.5 text-xs rounded-md bg-slate-200 
            text-slate-700 mr-2`,
      connection: "text-xs text-slate-400 ml-6 border-l-2 border-slate-200 pl-2"
    },
    features: {
      autoTags: true,
      showConnections: true,
      systemicLayout: true
    }
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

const NoteInterface = ({ creatorId, purpose }) => {
  const [entries, setEntries] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [encouragement, setEncouragement] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const creator = creators[creatorId];
  
  // Add effect to show transition when creator changes
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [creatorId]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      let newEntry = {
        text: currentInput,
        bullet: creator.features?.randomBullets 
          ? creator.features.randomBullets[
              Math.floor(Math.random() * creator.features.randomBullets.length)
            ]
          : creator.style.bullet,
        tags: creator.features?.autoTags 
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
      
      {encouragement && creator.features?.showEncouragement && (
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

const CreatorCard = ({ creator, id, selected, onSelect }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  // Custom styles for each creator
  const cardStyles = {
    jun: {
      background: `bg-slate-50 [background-image:linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%,#f1f5f9),linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%,#f1f5f9)] bg-[length:16px_16px] bg-[position:0_0,8px_8px]`,
      aesthetics: [
        { id: 'minimal', label: 'Minimalist', color: 'bg-slate-200' },
        { id: 'oneThought', label: 'One thought at a time', color: 'bg-slate-300' }
      ]
    },
    luna: {
      background: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      aesthetics: [
        { id: 'encouraging', label: 'Encouraging', color: 'bg-yellow-200' },
        { id: 'natural', label: 'Natural beauty', color: 'bg-orange-200' }
      ]
    },
    marcus: {
      background: 'bg-blue-50 [background-image:linear-gradient(white_2px,transparent_2px),linear-gradient(90deg,white_2px,transparent_2px)] bg-[size:32px_32px]',
      aesthetics: [
        { id: 'organized', label: 'Thought organization', color: 'bg-blue-200' },
        { id: 'systematic', label: 'Systematic', color: 'bg-indigo-200' }
      ]
    }
  };

  const style = cardStyles[id];

  const handleSubscribe = (e) => {
    e.stopPropagation(); // Prevent card selection when clicking heart
    setIsSubscribed(!isSubscribed);
  };

  return (
    <div className="relative group">
      <button
        onClick={() => onSelect(id)}
        className={`
          w-full p-4 rounded-xl text-left transition-all
          ${style.background}
          ${selected 
            ? 'ring-2 ring-emerald-500 shadow-lg' 
            : 'hover:shadow-md'
          }
        `}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium mb-4">{creator.vibe}</div>
            <div className="text-sm text-slate-600">by {creator.name}</div>
          </div>
          <button 
            onClick={handleSubscribe}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            {isSubscribed ? '❤️' : '🤍'}
          </button>
        </div>
        
        <button className="absolute bottom-3 right-3 text-xs px-2 py-1 bg-white/80 backdrop-blur-sm 
          text-slate-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          Show Artifacts
        </button>
      </button>

      <div className="flex gap-2 mt-2 ml-2">
        {style.aesthetics.map(aesthetic => (
          <div
            key={aesthetic.id}
            className={`
              w-8 h-8 rounded-full ${aesthetic.color}
              flex items-center justify-center
              transition-transform hover:scale-110
            `}
            title={aesthetic.label}
          />
        ))}
      </div>
    </div>
  );
};

const CreatorSidebar = ({ selected, onSelect }) => (
  <div className="w-80 h-[calc(100vh-2rem)] overflow-y-auto space-y-6 p-4">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-medium text-slate-700">Choose Style</h2>
      <button 
        onClick={() => alert('Become a creator feature coming soon!')}
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
        />
      ))}
    </div>
  </div>
);

const Demo = () => {
  const [selectedPurpose, setSelectedPurpose] = useState('capture'); // Default purpose
  const [selectedCreator, setSelectedCreator] = useState('luna');    // Default creator

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Purpose Section */}
        <div className="mb-8">
          <PurposeSelector 
            selected={selectedPurpose}
            onSelect={setSelectedPurpose}
          />
        </div>

        {/* Main Layout */}
        <div className="flex gap-6">
          {/* Center Note Interface - Now with card styling */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <NoteInterface 
                creatorId={selectedCreator}
                purpose={selectedPurpose}
              />
            </div>
          </div>

          {/* Right Creator Sidebar */}
          <CreatorSidebar
            selected={selectedCreator}
            onSelect={setSelectedCreator}
          />
        </div>
      </div>
    </div>
  );
};

export default Demo;