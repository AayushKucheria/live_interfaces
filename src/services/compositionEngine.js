import OpenAI from 'openai';
import axios from 'axios';
import sourceCodeRegistry, { getSourceCode } from './sourceCodeRegistry';
import React from 'react';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// OpenRouter base URL and headers setup
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const COMPOSITION_PROMPT = `
You're a React composition expert. Combine these two interface patterns into one cohesive component:

Pattern 1: {pattern1}
Component Code 1:
{componentCode1}

Pattern 2: {pattern2}
Component Code 2:
{componentCode2}

COMPOSITION PRINCIPLES:
1. Understand each component's core PURPOSE before combining them
2. Preserve ALL functionality from both components
3. Share state intelligently between components when it makes sense
4. Ensure all effects, timers, and callbacks work properly with appropriate dependencies
5. Avoid duplicating state or functionality
6. The composed component should feel like it was designed as a single unit

IMPLEMENTATION REQUIREMENTS:
- Use React.createElement instead of JSX
- Name your component 'ComposedComponent'
- Attach metadata as ComposedComponent.metadata
- Create a working Example as ComposedComponent.Example
- Follow the section markers exactly as shown below

\`\`\`jsx
// COMPONENT_START
const ComposedComponent = () => {
  // Implementation here using React.createElement
}
// COMPONENT_END

// METADATA_START
ComposedComponent.metadata = {
  title: "Descriptive Title",
  description: "How these patterns work together", 
  category: "composed"
}
// METADATA_END

// EXAMPLE_START
ComposedComponent.Example = () => {
  // Working example here
}
// EXAMPLE_END
\`\`\`
`;

// Add a debug logger utility
const debugLog = (message, data) => {
  if (import.meta.env.MODE === 'development') {
    console.group(`[CompositionEngine] ${message}`);
    if (data) console.log(data);
    console.groupEnd();
  }
};

// Function to analyze a component and extract key information
const analyzeComponent = (pattern) => {
  const analysis = {
    states: [],
    effects: [],
    callbacks: [],
    timerUsage: false,
    dependencies: new Set(),
    props: []
  };
  
  // Extract component code
  const code = getSourceCode(pattern.id) || '';
  
  // Detect useState
  const stateMatches = code.match(/const\s+\[\s*(\w+)\s*,\s*set(\w+)\s*\]\s*=\s*useState/g) || [];
  stateMatches.forEach(match => {
    const stateVar = match.match(/const\s+\[\s*(\w+)/)[1];
    analysis.states.push(stateVar);
  });
  
  // Detect useEffect
  analysis.effects = (code.match(/useEffect\(\s*\(\)\s*=>/g) || []).length;
  
  // Detect timers
  analysis.timerUsage = code.includes('setTimeout') || code.includes('setInterval');
  
  // Identify props
  const propsPattern = /\{\s*([^}]+)\s*\}\s*=\s*props/;
  const propsMatch = code.match(propsPattern);
  if (propsMatch) {
    analysis.props = propsMatch[1].split(',').map(p => p.trim());
  }
  
  return analysis;
};

export async function composePatterns(pattern1, pattern2) {
  const debugInfo = {
    originalCode: null,
    sanitizedCode: null,
    extractionResults: null,
    error: null,
    timestamp: new Date().toISOString()
  };
  
  try {
    const openRouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!openRouterApiKey) {
      throw new Error("OpenRouter API key is required but not available");
    }
    
    debugLog("Composing patterns", {
      pattern1: pattern1.metadata.title,
      pattern2: pattern2.metadata.title
    });
    
    // Extract component code from registry if available, or fall back to a simpler representation
    const getCleanComponentCode = (pattern) => {
      // Try to get source from registry first
      if (pattern.id && getSourceCode(pattern.id)) {
        return getSourceCode(pattern.id);
      }
      
      try {
        // Fallback to a cleaner representation than toString()
        const component = pattern.component;
        
        // Create a simplified representation that's still useful
        return `
// Note: This is a simplified representation of the component
const ${pattern.id || 'Component'} = (props) => {
  // Component takes these props:
  // ${Object.keys(pattern.metadata || {}).join(', ')}
  
  // The component renders a UI based on ${pattern.metadata?.description || 'the provided props'}
  
  // For more details, see the metadata:
  // ${JSON.stringify(pattern.metadata, null, 2)}
};`;
      } catch (error) {
        console.error("Failed to create component code representation:", error);
        return "// Component code representation unavailable";
      }
    };
    
    // Get cleaner component code
    const componentCode1 = getCleanComponentCode(pattern1);
    const componentCode2 = getCleanComponentCode(pattern2);
    
    // Add this analysis to the composition prompt
    const enhancedPrompt = COMPOSITION_PROMPT
      .replace('{pattern1}', JSON.stringify({
        ...pattern1.metadata,
        analysis: analyzeComponent(pattern1)
      }))
      .replace('{pattern2}', JSON.stringify({
        ...pattern2.metadata,
        analysis: analyzeComponent(pattern2)
      }));
    
    // Log the full prompt to console for debugging
    debugLog("Full composition prompt", enhancedPrompt);
    
    // Store the prompt in debug info
    debugInfo.prompt = enhancedPrompt;
    
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "anthropic/claude-3-7-sonnet",
        messages: [{
          role: "user",
          content: enhancedPrompt
        }],
        temperature: 0.3,
        max_tokens: 4000,
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Interface Pattern Composer',
          'Content-Type': 'application/json',
        }
      }
    );
    
    const code = response.data.choices[0].message.content;
    debugInfo.originalCode = code;
    
    debugLog("Received raw code from AI", { codeLength: code.length });
    
    // Process the component with enhanced debugging
    const result = sanitizeAndParseComponent(code, debugInfo);
    
    // Include debug info in the result
    return {
      ...result,
      debugInfo
    };
  } catch (error) {
    debugLog("Composition failed", error);
    debugInfo.error = {
      message: error.message,
      stack: error.stack
    };
    
    return {
      code: "",
      component: null,
      metadata: null,
      example: null,
      error: `Failed to compose patterns: ${error.message || "Unknown error"}`,
      debugInfo
    };
  }
}

function sanitizeAndParseComponent(code, debugInfo = {}) {
  try {
    // Basic security sanitization
    const sanitized = code
      .replace(/dangerouslySetInnerHTML/g, '')
      .replace(/innerHTML/g, '')
      .replace(/eval\(/g, '')
      // Remove import statements
      .replace(/import.*?;(\r?\n|\r)/g, '')
      // Fix fancy quotes and apostrophes
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"')
      // Fix other common syntax issues
      .replace(/\u2019/g, "'") // Right single quotation mark
      .replace(/\u2018/g, "'") // Left single quotation mark
      .replace(/\u201C/g, '"') // Left double quotation mark
      .replace(/\u201D/g, '"'); // Right double quotation mark
    
    debugInfo.sanitizedCode = sanitized;
    
    // Extract component name for better regex fallbacks
    const componentNameMatch = sanitized.match(/const\s+(\w+)\s*=/);
    const componentName = componentNameMatch ? componentNameMatch[1] : 'CombinedComponent';
    debugInfo.extractedComponentName = componentName;
    
    // Extract component parts using more reliable section markers
    const extractSection = (startMarker, endMarker) => {
      const startIndex = sanitized.indexOf(startMarker);
      if (startIndex === -1) {
        debugLog(`Section marker not found: ${startMarker}`);
        return null;
      }
      
      const contentStartIndex = startIndex + startMarker.length;
      const endIndex = sanitized.indexOf(endMarker, contentStartIndex);
      if (endIndex === -1) {
        debugLog(`End marker not found: ${endMarker}`);
        return null;
      }
      
      return sanitized.substring(contentStartIndex, endIndex).trim();
    };

    const component = extractSection('// COMPONENT_START', '// COMPONENT_END');
    const metadata = extractSection('// METADATA_START', '// METADATA_END');
    const example = extractSection('// EXAMPLE_START', '// EXAMPLE_END');
    
    // Store extraction results for debugging
    debugInfo.extractionResults = {
      componentFound: !!component,
      metadataFound: !!metadata,
      exampleFound: !!example,
      componentLength: component?.length || 0,
      metadataLength: metadata?.length || 0,
      exampleLength: example?.length || 0,
      componentName
    };

    // Fallback to regex with the detected component name if needed
    const componentRegex = new RegExp(`const\\s+${componentName}\\s*=\\s*(.*?)\\s*;\\/\\/\\s*(COMPONENT_END|METADATA_START|Metadata)`, 'gs');
    const metadataRegex = new RegExp(`${componentName}\\.metadata\\s*=\\s*(.*?)\\s*;\\/\\/\\s*(METADATA_END|EXAMPLE_START|Example)`, 'gs');
    const exampleRegex = new RegExp(`${componentName}\\.Example\\s*=\\s*(.*?)(?:;|\\s*\\/\\/\\s*EXAMPLE_END|$)`, 'gs');
    
    if (!component || !metadata || !example) {
      debugLog("Using regex fallback for parsing with component name: " + componentName, { 
        missingComponent: !component,
        missingMetadata: !metadata,
        missingExample: !example
      });
    }

    // Analyze code for potential issues
    const potentialIssues = analyzeCodeForIssues(sanitized);
    debugInfo.potentialIssues = potentialIssues;
    
    return {
      code: sanitized,
      component: component || extractRegexPart(componentRegex, sanitized),
      metadata: metadata || extractRegexPart(metadataRegex, sanitized),
      example: example || extractRegexPart(exampleRegex, sanitized),
      componentName,
      debugInfo
    };
  } catch (error) {
    debugLog("Error in sanitizeAndParseComponent", error);
    debugInfo.error = {
      phase: "parsing",
      message: error.message,
      stack: error.stack
    };
    return {
      code: code || "",
      component: null,
      metadata: null,
      example: null,
      error: `Failed to parse component: ${error.message}`,
      debugInfo
    };
  }
}

// Enhance the analysis to detect more potential issues
function analyzeCodeForIssues(code) {
  const issues = [];
  
  // Check for JSX syntax instead of React.createElement
  if (code.includes('<') && code.includes('/>')) {
    issues.push({
      type: "jsx_syntax",
      severity: "high",
      message: "Contains JSX syntax instead of React.createElement"
    });
  }
  
  // Check for missing React dependencies
  if (code.includes('useState(') && !code.includes('React.useState(')) {
    issues.push({
      type: "missing_hook_reference",
      severity: "high",
      message: "Uses useState but may not reference it correctly, try React.useState"
    });
  }
  
  // Check for invalid object syntax
  if ((code.match(/\{/g) || []).length !== (code.match(/\}/g) || []).length) {
    issues.push({
      type: "unbalanced_braces",
      severity: "high",
      message: "Unbalanced braces in the code"
    });
  }
  
  // Check for fancy quotes that might cause syntax errors
  if (code.match(/[''""]/)) {
    issues.push({
      type: "fancy_quotes",
      severity: "high",
      message: "Contains fancy quotes that can cause syntax errors"
    });
  }
  
  // Check for improper object property syntax
  if (code.includes(': ,') || code.includes(',}')) {
    issues.push({
      type: "invalid_object_syntax",
      severity: "medium",
      message: "Invalid object property syntax detected"
    });
  }
  
  return issues;
}

function extractRegexPart(regex, code) {
  const match = regex.exec(code);
  return match ? match[1] : null;
}

const testComposedComponent = (Component) => {
  const issues = [];
  
  // Test component rendering
  try {
    const elem = React.createElement(Component);
    if (!elem) issues.push("Component doesn't render");
  } catch (error) {
    issues.push(`Render error: ${error.message}`);
  }
  
  // Test state updates
  // ... add more tests as needed
  
  return issues;
}; 