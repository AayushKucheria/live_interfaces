import React, { useState, useRef, useEffect } from 'react';

export const metadata = {
  title: "Micro Interaction Feedback",
  description: "Provides subtle visual responses to user actions, increasing confidence",
  category: "feedback"
};

// Ripple effect component for click feedback
const Ripple = ({ color = 'rgba(255,255,255,0.3)', duration = 600 }) => {
  const [ripples, setRipples] = useState([]);
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Cleanup old ripples
    const interval = setInterval(() => {
      if (ripples.length > 0) {
        setRipples(ripples.filter(ripple => {
          return ripple.timestamp + duration > Date.now();
        }));
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [ripples, duration]);
  
  const addRipple = (event) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const diameter = Math.max(rect.width, rect.height) * 2;
    
    setRipples([
      ...ripples,
      {
        x,
        y,
        diameter,
        timestamp: Date.now()
      }
    ]);
  };
  
  return (
    <div 
      ref={containerRef}
      className="ripple-container absolute inset-0 overflow-hidden pointer-events-none"
      onPointerDown={addRipple}
    >
      {ripples.map((ripple, i) => {
        const remainingTime = ripple.timestamp + duration - Date.now();
        const opacity = Math.min(1, remainingTime / duration);
        
        return (
          <div
            key={`${ripple.x}-${ripple.y}-${i}`}
            className="ripple absolute rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
              width: `${ripple.diameter}px`,
              height: `${ripple.diameter}px`,
              background: color,
              opacity: opacity,
              transition: `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`,
              transform: `translate(-50%, -50%) scale(${opacity === 1 ? 0 : 1})`
            }}
          />
        );
      })}
    </div>
  );
};

// Highlight effect for hover feedback
const Highlight = ({ color = 'rgba(59, 130, 246, 0.1)', children }) => {
  return (
    <div className="highlight-container relative transition-colors duration-200 hover:bg-opacity-10 rounded-sm" style={{ backgroundColor: color }}>
      {children}
    </div>
  );
};

// Pulse effect for attention feedback
const Pulse = ({ color = 'rgba(59, 130, 246, 0.7)', size = '10px', duration = 1500 }) => {
  return (
    <div className="pulse-container relative inline-flex mx-1">
      <span 
        className="flex absolute h-3 w-3 -right-1 -top-1"
      >
        <span 
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ 
            backgroundColor: color,
            animationDuration: `${duration}ms`
          }}
        />
        <span 
          className="relative inline-flex rounded-full h-3 w-3"
          style={{ backgroundColor: color }}
        />
      </span>
    </div>
  );
};

// Scale effect for click feedback
const Scale = ({ children, scale = 0.96, duration = 100 }) => {
  const [isActive, setIsActive] = useState(false);
  
  return (
    <div 
      className="scale-container inline-block transition-transform"
      style={{ 
        transform: isActive ? `scale(${scale})` : 'scale(1)',
        transitionDuration: `${duration}ms` 
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onMouseLeave={() => setIsActive(false)}
    >
      {children}
    </div>
  );
};

const MicroInteractionFeedback = ({ 
  children, 
  className = "", 
  feedbackType = "pulse", 
  ...props 
}) => {
  const [interactionElements, setInteractionElements] = useState([]);
  const [nextId, setNextId] = useState(0);
  
  const createInteraction = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = e.currentTarget.parentElement.getBoundingClientRect();
    
    const posX = rect.left - containerRect.left + rect.width / 2;
    const posY = rect.top - containerRect.top + rect.height / 2;
    
    const newInteraction = {
      id: nextId,
      type: feedbackType,
      x: posX,
      y: posY,
      timestamp: Date.now()
    };
    
    setInteractionElements(prev => [...prev, newInteraction]);
    setNextId(prev => prev + 1);
    
    // Remove the element after animation completes
    setTimeout(() => {
      setInteractionElements(prev => prev.filter(item => item.id !== newInteraction.id));
    }, 1000);
  };
  
  // Wrap children with interaction handlers
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onClick: (e) => {
          createInteraction(e);
          if (child.props.onClick) {
            child.props.onClick(e);
          }
        }
      });
    }
    return child;
  });
  
  return (
    <div className={`micro-interaction-feedback relative ${className}`} {...props}>
      {enhancedChildren}
      
      {/* Render feedback effects */}
      {interactionElements.map((interaction) => {
        if (interaction.type === "pulse") {
          return (
            <div
              key={interaction.id}
              className="absolute pointer-events-none rounded-full bg-emerald-400/30 animate-ping"
              style={{
                left: interaction.x,
                top: interaction.y,
                width: '50px',
                height: '50px',
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        }
        
        if (interaction.type === "sparkle") {
          return (
            <div
              key={interaction.id}
              className="absolute pointer-events-none"
              style={{
                left: interaction.x,
                top: interaction.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-yellow-400 rounded-full animate-ping"
                  style={{
                    width: '8px',
                    height: '8px',
                    transform: `rotate(${i * 72}deg) translate(20px, 0)`,
                    animationDuration: '0.8s',
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
};

// Example usage for demo purposes
export const Example = () => {
  const [selected, setSelected] = useState(null);
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-6">
        {/* Ripple Effect Demo */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Ripple Effect</h4>
          <MicroInteractionFeedback type="ripple">
            <button className="w-full py-3 px-4 bg-blue-500 text-white rounded text-center">
              Click Me
            </button>
          </MicroInteractionFeedback>
        </div>
        
        {/* Highlight Effect Demo */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Highlight Effect</h4>
          <MicroInteractionFeedback type="highlight" color="rgba(59, 130, 246, 0.15)">
            <div className="w-full p-4 border rounded">
              Hover over this card
            </div>
          </MicroInteractionFeedback>
        </div>
        
        {/* Scale Effect Demo */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Scale Effect</h4>
          <MicroInteractionFeedback type="scale" duration={80}>
            <button className="w-full py-3 px-4 bg-emerald-500 text-white rounded text-center">
              Press Me
            </button>
          </MicroInteractionFeedback>
        </div>
        
        {/* Pulse Effect Demo */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Pulse Notification</h4>
          <div className="p-4 border rounded flex items-center">
            <span>Notifications</span>
            <MicroInteractionFeedback type="pulse" color="rgba(239, 68, 68, 0.7)" />
          </div>
        </div>
      </div>
      
      {/* Combined Demo */}
      <div className="pt-4 mt-4 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-700 mb-4">Combined Interactions</h4>
        <div className="flex space-x-3">
          {[1, 2, 3].map(item => (
            <MicroInteractionFeedback key={item} type="ripple">
              <MicroInteractionFeedback type="scale">
                <button
                  onClick={() => setSelected(item)}
                  className={`
                    py-2 px-4 rounded border transition-colors
                    ${selected === item
                      ? 'bg-purple-500 text-white border-purple-600'
                      : 'bg-white hover:bg-purple-50 border-slate-200'
                    }
                  `}
                >
                  Option {item}
                </button>
              </MicroInteractionFeedback>
            </MicroInteractionFeedback>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MicroInteractionFeedback; 