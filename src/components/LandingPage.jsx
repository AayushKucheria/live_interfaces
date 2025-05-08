import React, { useState, useRef, useEffect } from 'react';

// Landing Page component
const LandingPage = ({ onCreateNew, onBrowseModels, onSkip }) => {
  // Add state for tooltip visibility
  const [showTooltip, setShowTooltip] = useState(false);
  
  // State for the "Create New Model" button interaction
  const [buttonState, setButtonState] = useState('idle'); // 'idle', 'holding', 'loading', 'input'
  const [pressStartTime, setPressStartTime] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const holdTimeoutRef = useRef(null);
  const loadingIntervalRef = useRef(null);
  
  // State for the "Models... of what?" button and its children
  const [showChildButtons, setShowChildButtons] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Template texts for each category
  const categoryTemplates = {
    environment: "Create a causal loop diagram showing the relationships between climate change, biodiversity loss, and ecosystem resilience. Include feedback loops related to carbon emissions, temperature rise, and habitat disruption.",
    technology: "Design a system model exploring how artificial intelligence adoption impacts labor markets, productivity, and innovation. Consider feedback loops between technological development, skill acquisition, and economic growth.",
    culture: "Model the interconnections between social media, cultural polarization, and information spread. Include variables for trust, social cohesion, and belief formation with appropriate feedback mechanisms.",
    geopolitics: "Develop a causal model of resource competition, international cooperation, and conflict. Include feedback loops related to scarcity, alliance formation, and economic interdependence.",
    relationships: "Create a system diagram exploring interpersonal dynamics, trust building, and conflict resolution. Model feedback loops related to communication patterns, emotional responses, and behavior reinforcement."
  };
  
  // Update input text when category changes
  useEffect(() => {
    if (selectedCategory) {
      setInputValue(categoryTemplates[selectedCategory] || '');
    }
  }, [selectedCategory]);
  
  // Function to handle icon click
  const handleIconClick = (e) => {
    e.preventDefault();
    setShowTooltip(true);
    
    // Hide tooltip after 3 seconds
    setTimeout(() => {
      setShowTooltip(false);
    }, 1500);
  };
  
  const resetLoadingState = () => {
    clearTimeout(holdTimeoutRef.current);
    clearInterval(loadingIntervalRef.current);
    holdTimeoutRef.current = null;
    loadingIntervalRef.current = null;
    setButtonState('idle');
    setLoadingProgress(0);
    setPressStartTime(null);
  };
  
  const handleMouseDown = () => {
    setButtonState('holding');
    setPressStartTime(Date.now());

    // Start timeout to transition to loading/input after 1 second
    holdTimeoutRef.current = setTimeout(() => {
      setButtonState('loading');
      
      // Start loading bar animation (0 to 100% over 1 second)
      const loadingDuration = 1000; // 1 second
      const startTime = Date.now();
      
      loadingIntervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / loadingDuration, 1);
        setLoadingProgress(progress);

        if (progress >= 1) {
          clearInterval(loadingIntervalRef.current);
          setButtonState('input');
        }
      }, 16); // ~60fps update

    }, 500); // Start loading after 0.5 seconds of holding
  };
  
  const handleMouseUp = () => {
    if (buttonState === 'holding') {
      const pressDuration = Date.now() - pressStartTime;
      if (pressDuration < 500) {
        // Short click: execute original action
        onCreateNew();
      }
    }
    // If state is 'loading' or 'input', releasing the mouse doesn't revert it
    // Only reset if it was just 'holding' or if leaving the button area
    if (buttonState === 'holding') {
       resetLoadingState();
    }
  };
  
  const handleMouseLeave = () => {
    // If mouse leaves while holding (before transition), reset
    if (buttonState === 'holding') {
      resetLoadingState();
    }
  };
  
  // Function to toggle child buttons
  const handleToggleChildButtons = () => {
    setShowChildButtons(!showChildButtons);
    // If showing child buttons, also transition to input mode
    if (!showChildButtons) {
      setButtonState('input');
    }
  };

  // Function to handle child button click
  const handleChildButtonClick = (id) => {
    setSelectedCategory(currentSelected => currentSelected === id ? null : id);
  };
  
  // Cleanup timeouts/intervals on unmount
  useEffect(() => {
    return () => {
      clearTimeout(holdTimeoutRef.current);
      clearInterval(loadingIntervalRef.current);
    };
  }, []);
  
  return (
    <div className="h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Live World Models</h1>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto p-8">
          {/* Hero section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8 relative">
              {/* Earth icon with glow effect on hover */}
              <div 
                className="relative w-32 h-32 cursor-pointer group"
                onClick={handleIconClick}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-20 animate-pulse group-hover:animate-none group-hover:opacity-0 transition-opacity duration-300"></div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-30 group-hover:opacity-0 transition-opacity duration-300"></div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-300 to-blue-600 opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300"></div>
                
                {/* Earth icon */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center transition-all duration-300 group-hover:from-blue-500 group-hover:to-blue-800">
                  <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                {/* Easter egg tooltip */}
                {showTooltip && (
                  <div className="absolute bottom-0 left-1/2 transform translate-y-full -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-80 whitespace-nowrap">
                    Ceci n'est pas le monde.
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-b-gray-900"></div>
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Live World Models</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Explore, create, and analyze causal loop diagrams. 
              Visualize complex systems and intuitively understand their behavior!
            </p>
            
            {/* "Models... of what?" button and child toggles */}
            <div className="mb-8">
              <button 
                onClick={handleToggleChildButtons}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
              >
                Models... of what?
              </button>
              
              {showChildButtons && (
                <>
                  <p className="mt-8 text-sm text-gray-600 text-center">
                    Anything you like! Some potential domains include:
                  </p>
                  <div className="mt-4 flex justify-center space-x-2">
                    {[
                      { id: 'environment', label: 'Environment' },
                      { id: 'technology', label: 'Technology' },
                      { id: 'culture', label: 'Culture' },
                      { id: 'geopolitics', label: 'Geopolitics' },
                      { id: 'relationships', label: 'Relationships' }
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => handleChildButtonClick(id)}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                          selectedCategory === id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Action buttons - made more central and prominent */}
            <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-blue-100 mb-12">
              <div className="flex flex-col space-y-4">
                <div 
                  className={`relative px-8 py-5 ${buttonState !== 'input' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-white border border-gray-300'} text-white text-xl font-bold rounded-lg shadow-lg ${buttonState !== 'input' ? 'hover:from-green-600 hover:to-green-700' : ''} transition-all duration-300 flex items-center justify-center ${buttonState !== 'input' ? 'transform hover:scale-105 cursor-pointer' : ''}`}
                  onMouseDown={buttonState !== 'input' ? handleMouseDown : undefined}
                  onMouseUp={buttonState !== 'input' ? handleMouseUp : undefined}
                  onMouseLeave={buttonState !== 'input' ? handleMouseLeave : undefined}
                  style={{ minHeight: '76px' }} // Ensure consistent height
                >
                  {buttonState === 'input' ? (
                    <div className="relative w-full h-full flex items-center">
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Describe the model you want to create..."
                        className="w-full h-24 pl-3 pr-10 py-2 text-base font-normal text-gray-700 bg-transparent border-none rounded-lg resize-none focus:outline-none focus:ring-0"
                        maxLength={500} // Example max length
                      />
                      <button
                        onClick={onSkip} // Reuse the onSkip handler
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-full hover:bg-green-100 transition-all"
                        aria-label="Confirm input"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Loading Bar Overlay */}
                      {buttonState === 'loading' && (
                        <div className="absolute inset-0 rounded-lg overflow-hidden">
                           <div 
                             className="h-full bg-gradient-to-r from-green-400 to-green-600 opacity-75 transition-all duration-100 ease-linear"
                             style={{ width: `${loadingProgress * 100}%` }}
                           ></div>
                        </div>
                      )}
                      {/* Button Content */}
                      <div className="relative z-10 flex items-center justify-center w-full">
                        <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create New Model
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center text-gray-500 font-medium my-1">or</div>
                <button 
                  onClick={onBrowseModels}
                  className="px-8 py-5 bg-white text-blue-700 text-xl font-bold rounded-lg shadow-md border-2 border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center transform hover:scale-105"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Browse Models
                </button>
              </div>
            </div>
          </div>
          
          {/* Feature showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Programming</h3>
              <p className="text-gray-600">Draw, browse, and compose dynamic causal loop diagrams for modelling complex systems.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M5 5L19 19M19 5L5 19" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Category Theory</h3>
              <p className="text-gray-600">Category theory brings mathematical rigor and coherence to practical system modeling.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Enlivened Analysis</h3>
              <p className="text-gray-600">Auto-structuring helps identify accuracy improvements, merge models, and extract insights.</p>
            </div>
          </div>
          
          {/* Footer */}
          <footer className="w-full bg-white border-t border-gray-200 py-6 pb-0">
            <div className="w-full px-4 text-center">
              <p className="text-gray-500">Live Theory © 2025 — Built to aid category theory analyses via causal loop diagrams.</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default LandingPage; 