import { getSourceCode } from './sourceCodeRegistry';

/**
 * Get the best available representation of component code
 * @param {Object|string} component - Component to extract code from
 * @returns {string} - Clean component code for customization
 */
function extractComponentCode(component) {
  // Handle different component formats
  if (typeof component === 'string') {
    return component;
  }
  
  if (typeof component === 'object') {
    // Try different sources in order of reliability
    if (component.customCode) {
      return component.customCode;
    }
    
    if (component.id && getSourceCode(component.id)) {
      return getSourceCode(component.id);
    }
    
    // If component has original source attached (encourage this pattern)
    if (component.sourceCode) {
      return component.sourceCode;
    }
    
    // Last resort - use toString() but be aware it may not be useful
    if (typeof component.component === 'function') {
      const stringified = component.component.toString();
      
      // Check if it looks like proper component code with JSX
      if (stringified.includes('return') && 
          (stringified.includes('<') || stringified.includes('React.createElement'))) {
        return stringified;
      }
    }
    
    // Create a minimal representation based only on available metadata
    // This avoids biasing toward any specific customization type
    const componentName = component.metadata?.title?.replace(/\s+/g, '') || 'Component';
    return `
// Component based on available metadata
const ${componentName} = (props) => {
  // Component represents: ${component.metadata?.title || 'Unknown Component'}
  
  return (
    <div>
      {/* This component couldn't be properly extracted, so here's a minimal representation */}
      <div>{component.metadata?.title || 'Component'}</div>
    </div>
  );
};
`;
  }
  
  return "// Could not extract component code";
}

/**
 * Transforms component code to make relevant elements red
 * @param {string} code - The component code
 * @returns {string} - The modified component code
 */
function makeItRed(code) {
  // Pattern for JSX elements with div, p, span, h1-h6, button tags 
  const elementRegex = /(<(div|p|span|h[1-6]|button)[^>]*)(>)/g;
  
  // Transform by adding style prop with red color
  return code.replace(elementRegex, (match, openTag, tagName, closeChar) => {
    // Don't modify if already has color style
    if (openTag.includes('color:') || openTag.includes('text-red')) {
      return match;
    }
    
    // Add inline style or className based on what's already there
    if (openTag.includes('style={{')) {
      // Already has style object, add color property
      return openTag.replace(/style={{/, 'style={{color: "red", ') + closeChar;
    } else if (openTag.includes('style="')) {
      // Already has style attribute, add color property
      return openTag.replace(/style="/, 'style="color: red; ') + closeChar;
    } else if (openTag.includes('className="')) {
      // Already has className, add text-red-500 class
      return openTag.replace(/className="/, 'className="text-red-500 ') + closeChar;
    } else {
      // No style or className, add style
      return `${openTag} style={{color: "red"}}${closeChar}`;
    }
  });
}

/**
 * Transforms component code to add relevant emojis to text content
 * @param {string} code - The component code
 * @returns {string} - The modified component code
 */
function addMoreEmojis(code) {
  // Common text content patterns
  const patterns = [
    // Text within JSX tags: <Tag>Text</Tag>
    {
      regex: />([^<>]{2,})</g,
      handler: (match, text) => {
        return `>${addEmojiToText(text)}<`;
      }
    },
    // Text in string literals for props
    {
      regex: /(['"])([^'"]{3,})\1/g,
      handler: (match, quote, text) => {
        // Skip if it looks like a path, URL, or variable
        if (text.includes('/') || text.includes('.') || text.includes('${')) {
          return match;
        }
        return `${quote}${addEmojiToText(text)}${quote}`;
      }
    }
  ];

  let modifiedCode = code;
  for (const pattern of patterns) {
    modifiedCode = modifiedCode.replace(pattern.regex, pattern.handler);
  }
  
  return modifiedCode;
}

/**
 * Helper function to add relevant emoji to text based on content
 * @param {string} text - The text to add emoji to
 * @returns {string} - Text with emojis added
 */
function addEmojiToText(text) {
  // Skip if it already contains an emoji
  if (/[\p{Emoji}]/u.test(text)) {
    return text;
  }
  
  // Mapping of keywords to emojis
  const emojiMap = {
    'success': ' ✅ ',
    'error': ' ❌ ',
    'warning': ' ⚠️ ',
    'info': ' ℹ️ ',
    'button': ' 👆 ',
    'click': ' 👆 ',
    'user': ' 👤 ',
    'users': ' 👥 ',
    'person': ' 👤 ',
    'people': ' 👥 ',
    'settings': ' ⚙️ ',
    'config': ' ⚙️ ',
    'time': ' ⏰ ',
    'clock': ' 🕒 ',
    'calendar': ' 📅 ',
    'date': ' 📅 ',
    'money': ' 💰 ',
    'payment': ' 💳 ',
    'search': ' 🔍 ',
    'find': ' 🔍 ',
    'mail': ' 📧 ',
    'email': ' 📧 ',
    'message': ' 💬 ',
    'chat': ' 💬 ',
    'notification': ' 🔔 ',
    'alert': ' 🚨 ',
    'save': ' 💾 ',
    'download': ' ⬇️ ',
    'upload': ' ⬆️ ',
    'delete': ' 🗑️ ',
    'remove': ' 🗑️ ',
    'add': ' ➕ ',
    'create': ' ✨ ',
    'new': ' ✨ ',
    'edit': ' ✏️ ',
    'update': ' 🔄 ',
    'refresh': ' 🔄 ',
    'loading': ' ⏳ ',
    'wait': ' ⏳ ',
    'star': ' ⭐ ',
    'favorite': ' ❤️ ',
    'like': ' 👍 ',
    'dislike': ' 👎 ',
    'home': ' 🏠 ',
    'dashboard': ' 📊 ',
    'chart': ' 📈 ',
    'graph': ' 📊 ',
    'report': ' 📑 ',
    'document': ' 📄 ',
    'file': ' 📁 ',
    'folder': ' 📂 ',
    'login': ' 🔑 ',
    'logout': ' 🚪 ',
    'lock': ' 🔒 ',
    'unlock': ' 🔓 ',
    'security': ' 🛡️ ',
    'product': ' 🛒 ',
    'shop': ' 🛍️ ',
    'cart': ' 🛒 ',
    'store': ' 🏪 ',
    'done': ' ✅ ',
    'complete': ' ✅ ',
    'check': ' ✓ ',
    'todo': ' 📝 ',
    'task': ' ✓ ',
    'list': ' 📋 ',
    'phone': ' 📱 ',
    'call': ' 📞 ',
    'camera': ' 📷 ',
    'photo': ' 🖼️ ',
    'image': ' 🖼️ ',
    'picture': ' 🖼️ ',
    'video': ' 🎥 ',
    'music': ' 🎵 ',
    'audio': ' 🔊 ',
    'sound': ' 🔊 ',
    'volume': ' 🔊 ',
    'mute': ' 🔇 ',
    'location': ' 📍 ',
    'map': ' 🗺️ ',
    'direction': ' 🧭 ',
    'navigation': ' 🧭 ',
    'link': ' 🔗 ',
    'connect': ' 🔗 ',
    'share': ' 📤 ',
    'send': ' 📤 ',
    'receive': ' 📥 ',
    'error': ' ⚠️ ',
    'warning': ' ⚠️ ',
    'danger': ' ⚠️ ',
    'success': ' ✅ ',
    'complete': ' ✅ ',
    'finish': ' 🏁 ',
    'start': ' 🏁 ',
    'begin': ' 🏁 ',
    'cancel': ' ❌ ',
    'stop': ' 🛑 ',
    'pause': ' ⏸️ ',
    'play': ' ▶️ ',
    'resume': ' ▶️ ',
    'skip': ' ⏭️ ',
    'back': ' ⏮️ ',
    'previous': ' ⏮️ ',
    'next': ' ⏭️ ',
    'forward': ' ⏭️ ',
  };

  // Default emoji if no match is found
  const defaultEmoji = ' ✨ ';
  
  // Check for keyword matches
  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      // Add emoji to the beginning or end randomly for variety
      return Math.random() > 0.5 ? `${text}${emoji}` : `${emoji}${text}`;
    }
  }
  
  // No specific match found, add default emoji if not too short
  if (text.trim().length > 4) {
    return `${text} ${defaultEmoji}`;
  }
  
  return text;
}

/**
 * Customizes a component based on a natural language prompt
 * @param {Object|string} component - The component to customize
 * @param {string} userPrompt - The natural language prompt for customization
 * @returns {Promise<Object>} - The customized component code
 */
export async function customizeComponent(component, userPrompt) {
  console.log(`[CustomizationEngine] Starting customization for ${typeof component === 'object' ? component.metadata?.title || 'Unknown Component' : 'Component Code'}`);
  console.log(`[CustomizationEngine] User prompt: "${userPrompt}"`);
  
  try {
    // Extract the best available component code
    const componentCode = extractComponentCode(component);
    
    // Normalize the prompt for easier matching
    const normalizedPrompt = userPrompt.toLowerCase().trim();
    
    // Apply transformations based on the prompt
    let modifiedCode = componentCode;
    let hasVisibleChanges = false;
    
    // Handle specific prompts
    if (normalizedPrompt.includes('red') || normalizedPrompt.includes('make it red')) {
      console.log('[CustomizationEngine] Applying "make it red" transformation');
      modifiedCode = makeItRed(componentCode);
      hasVisibleChanges = true;
    } 
    else if (normalizedPrompt.includes('emoji') || normalizedPrompt.includes('add more emojis')) {
      console.log('[CustomizationEngine] Applying "add more emojis" transformation');
      modifiedCode = addMoreEmojis(componentCode);
      hasVisibleChanges = true;
    }
    // Add more custom transformations here as needed
    
    // If no specific transformation matched, return original with error
    if (!hasVisibleChanges) {
      return {
        success: false,
        error: `No transformation found for "${userPrompt}". Try "make it red" or "add more emojis".`
      };
    }
    
    // Return the result
    return {
      success: true,
      modifiedCode,
      originalCode: componentCode,
      hasVisibleChanges
    };
  } catch (error) {
    console.error("Customization error:", error);
    return {
      success: false,
      error: error.message || "Unknown error during customization"
    };
  }
} 