import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Patterns from './patterns';
import PatternContainer from './components/PatternContainer';
import { Info } from 'lucide-react';
import { composePatterns } from './services/compositionEngine';
import ComponentSandbox from './components/ComponentSandbox';
import { getSourceCode, hasSourceCode } from './services/sourceCodeRegistry';

function Demo() {
  const [selectedPatterns, setSelectedPatterns] = useState([]);
  const [infoPattern, setInfoPattern] = useState(null);
  const [composedComponent, setComposedComponent] = useState(null);
  const [compositionError, setCompositionError] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [compositionSource, setCompositionSource] = useState(null);
  const [showingComposed, setShowingComposed] = useState(false);
  
  // All available patterns from our library
  const allPatterns = Object.entries(Patterns)
    .filter(([name, pattern]) => pattern && typeof pattern === 'function' && name !== 'MicroInteractionFeedback')
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
    // Skip patterns with 'composed' category
    if (category === 'composed') return acc;
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
  
  const createSafeComponent = (codeData) => {
    try {
      // Extract the component code
      const componentCode = codeData.component;
      if (!componentCode) {
        throw new Error("No component code to evaluate");
      }
      
      // Extract component name from code
      const componentNameMatch = componentCode.match(/const\s+(\w+)\s*=/);
      const extractedComponentName = componentNameMatch ? componentNameMatch[1] : null;
      
      if (!extractedComponentName) {
        throw new Error("Could not identify component name in code");
      }
      
      // Create a safe evaluation environment with React
      const evalContext = `
        const { useState, useEffect, useRef, useCallback, useMemo } = React;
        
        try {
          // COMPONENT DEFINITION
          ${componentCode}
          
          // Try to extract metadata safely
          let extractedMetadata = null;
          try {
            extractedMetadata = ${extractedComponentName}.metadata;
          } catch (metadataError) {
            console.error("Failed to attach metadata:", metadataError);
          }
          
          // Try to extract example safely
          let extractedExample = null;
          try {
            extractedExample = ${extractedComponentName}.Example;
          } catch (exampleError) {
            console.error("Failed to attach example:", exampleError);
          }
          
          // Return everything for use
          return {
            component: ${extractedComponentName},
            componentName: "${extractedComponentName}",
            metadata: extractedMetadata,
            example: extractedExample
          };
        } catch (mainError) {
          console.error("Main evaluation error:", mainError);
          throw mainError;
        }
      `;
      
      // Try evaluating the code
      const evaluatedComponent = Function('React', `
        try {
          ${evalContext}
        } catch (evalError) {
          console.error("Component evaluation error:", evalError);
          return { error: evalError.message, component: null };
        }
      `)(React);
      
      // Check if we got back an error
      if (evaluatedComponent.error) {
        throw new Error(evaluatedComponent.error);
      }
      
      if (!evaluatedComponent.component || typeof evaluatedComponent.component !== 'function') {
        throw new Error("Failed to create a valid React component function");
      }
      
      return {
        component: evaluatedComponent.component,
        componentName: evaluatedComponent.componentName,
        metadata: evaluatedComponent.metadata || {
          title: evaluatedComponent.componentName || "Generated Component",
          description: "A component composed by AI",
          category: "composed"
        },
        example: evaluatedComponent.example || (() => React.createElement(evaluatedComponent.component))
      };
    } catch (error) {
      console.error("Component creation failed:", error);
      
      // Return null to indicate failure
      return { 
        component: null, 
        metadata: null, 
        example: null
      };
    }
  };
  
  const composeComponent = async (pattern1, pattern2) => {
    setIsComposing(true);
    setCompositionError(null);
    
    try {
      // We're intentionally cloning/enhancing the pattern objects here to avoid issues with React props being read-only
      const enhancedPattern1 = {
        metadata: pattern1.metadata,
        id: pattern1.id
      };
      
      const enhancedPattern2 = {
        metadata: pattern2.metadata,
        id: pattern2.id
      };
      
      // Extract component code
      const getComponentCode = (pattern) => {
        try {
          // First try to get from registry
          if (hasSourceCode(pattern.id)) {
            return getSourceCode(pattern.id);
          }
          
          // Fallback - create a simplified representation
          return `
// This is a simplified representation of the component
const ${pattern.id} = (props) => {
  // Component implements: ${pattern.metadata.title}
  // ${pattern.metadata.description}
};

// For more details, see the metadata:
/*
${JSON.stringify(pattern.metadata, null, 2)}
*/
`;
        } catch (error) {
          console.error("Failed to extract component code:", error);
          return "// Failed to extract component code";
        }
      };
      
      // Add component code to enhanced patterns
      enhancedPattern1.componentDetails = {
        name: pattern1.id,
        description: pattern1.metadata.description,
        category: pattern1.metadata.category,
        code: getComponentCode(pattern1)
      };
      
      enhancedPattern2.componentDetails = {
        name: pattern2.id,
        description: pattern2.metadata.description,
        category: pattern2.metadata.category,
        code: getComponentCode(pattern2)
      };
      
      // Store the pattern sources for reference
      setCompositionSource({
        pattern1: pattern1.metadata.title,
        pattern2: pattern2.metadata.title
      });
      
      const result = await composePatterns(enhancedPattern1, enhancedPattern2);
      
      // Create the component with proper error handling
      const SafeComponent = createSafeComponent({
        component: result.component,
        code: result.code
      });
      
      // Create a safe example component
      const SafeExample = () => {
        try {
          if (SafeComponent && SafeComponent.Example) {
            return React.createElement(SafeComponent.Example);
          }
          // Fallback to rendering the component directly if no example
          return React.createElement(SafeComponent.component);
        } catch (error) {
          console.error("Example rendering error:", error);
          return React.createElement('div', { className: 'error-message' }, 
            "Error rendering example: " + error.message
          );
        }
      };
      
      // Parse metadata safely without relying on component reference
      let parsedMetadata = { title: "Combined Component", description: "A composition of two patterns", category: "composed" };
      try {
        if (result.metadata) {
          // Extract just the object literal from the metadata string
          const metadataObjectMatch = result.metadata.match(/(\{[\s\S]*\})/);
          if (metadataObjectMatch && metadataObjectMatch[1]) {
            // Only eval the object literal portion
            parsedMetadata = eval(`(${metadataObjectMatch[1]})`);
          } else {
            console.warn("Could not extract metadata object from string:", result.metadata);
          }
        }
      } catch (error) {
        console.error("Metadata parsing error:", error);
      }
      
      setComposedComponent({
        component: SafeComponent.component,
        metadata: parsedMetadata,
        example: SafeExample
      });
      
      // Add fallback if component creation fails
      if (!SafeComponent || !SafeComponent.component) {
        const FallbackComponent = () => (
          <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
            <h3 className="font-medium text-yellow-800">Component Creation Failed</h3>
            <p className="mt-2 text-sm text-yellow-700">
              The AI generated code couldn't be executed directly.
            </p>
            
            <div className="mt-3">
              <p className="text-sm text-yellow-800">
                The component code had errors that prevented it from being created. Try composing again or select different patterns.
              </p>
            </div>
          </div>
        );
        
        setComposedComponent({
          component: FallbackComponent,
          metadata: {
            title: "Composition Failed",
            description: "The AI generated code couldn't be executed",
            category: "error"
          },
          example: FallbackComponent
        });
      }
      
      // Show composed view when successful
      setShowingComposed(true);
      
    } catch (error) {
      setCompositionError(error.message);
    } finally {
      setIsComposing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="min-h-screen flex">
        {/* Main Content Area - Shows selected patterns */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-medium mb-8">
              {showingComposed ? 'Composed Pattern' : 'Interface Patterns'}
            </h1>
            
            {showingComposed && composedComponent ? (
              <>
                <div className="mb-4">
                  <button 
                    onClick={() => setShowingComposed(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors flex items-center"
                  >
                    <span className="mr-1">←</span> Back to individual patterns
                  </button>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700">
                    This component combines the insights from <strong>{compositionSource?.pattern1}</strong> and <strong>{compositionSource?.pattern2}</strong>
                  </p>
                </div>
                
                <PatternContainer
                  pattern={composedComponent.component}
                  metadata={composedComponent.metadata}
                  example={composedComponent.example}
                />
                
                {compositionError && (
                  <div className="mt-4 text-red-500 bg-red-50 p-3 rounded-lg">
                    Composition Error: {compositionError}
                  </div>
                )}
              </>
            ) : selectedPatterns.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <p className="text-slate-600 text-lg">
                  Select patterns from the sidebar to see them in action
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {patterns.map(pattern => {
                  const isSourcePattern = 
                    compositionSource && 
                    (pattern.metadata.title === compositionSource.pattern1 || 
                     pattern.metadata.title === compositionSource.pattern2);
                     
                  return (
                    <button
                      key={pattern.id}
                      onClick={() => togglePattern(pattern.id)}
                      className={`
                        w-full text-left p-3 rounded-lg transition-all relative
                        ${selectedPatterns.includes(pattern.id) 
                          ? 'bg-emerald-50 border-2 border-emerald-400 shadow-sm' 
                          : isSourcePattern && showingComposed
                            ? 'bg-blue-50 border-2 border-blue-300 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                        }
                        ${isComposing ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      disabled={isComposing}
                    >
                      {selectedPatterns.includes(pattern.id) && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full"></div>
                      )}
                      {isSourcePattern && showingComposed && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
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
                  );
                })}
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
        
        <div className="fixed bottom-4 right-4 space-y-2">
          <button 
            onClick={() => {
              if (selectedPatterns.length === 2) {
                // Get the full pattern objects from the IDs
                const pattern1 = allPatterns.find(p => p.id === selectedPatterns[0]);
                const pattern2 = allPatterns.find(p => p.id === selectedPatterns[1]);
                
                // Pass the full pattern objects with their metadata
                composeComponent(pattern1, pattern2);
              }
            }}
            disabled={selectedPatterns.length !== 2 || isComposing}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 relative"
          >
            {isComposing ? (
              <>
                <span className="inline-block animate-spin mr-2">🌀</span>
                Composing...
              </>
            ) : (
              `Compose Selected (${selectedPatterns.length}/2)`
            )}
          </button>
          
          {compositionError && (
            <div className="text-red-500 bg-red-50 p-3 rounded-lg">
              Composition Error: {compositionError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Demo;