import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Define the exact structure we want from GPT
const STYLE_PRESETS = {
  minimal: {
    container: "space-y-4 p-8 bg-gray-50",
    input: "w-full p-4 bg-transparent border-none focus:outline-none",
    entry: "flex items-start space-x-4 py-3",
    bullet: "•",
  },
  playful: {
    container: "space-y-4 p-6 bg-gradient-to-br from-purple-50 to-blue-50",
    input: "w-full p-4 rounded-xl bg-white/70 border-2",
    entry: "flex items-start space-x-3 py-2",
    bullet: "✨",
  },
  structured: {
    container: "space-y-2 p-6 bg-slate-50",
    input: "w-full p-3 bg-white border-b-2 border-slate-200",
    entry: "flex items-start space-x-3 py-2",
    bullet: "→",
  }
};

export async function processCreatorInput(creatorData) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `Based on this creator's input:
          ${creatorData.inspiration}
          ${creatorData.vibe}
          
          Generate a simple interface configuration.`
      }
    ],
    functions: [
      {
        name: "generateInterface",
        description: "Generate interface configuration based on creator input",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "Creator's name" },
            baseStyle: { 
              type: "string", 
              enum: ["minimal", "playful", "structured"],
              description: "Base style preset to use"
            },
            customizations: {
              type: "object",
              properties: {
                bullet: { 
                  type: "string", 
                  description: "Single character to use as bullet point" 
                },
                primaryColor: {
                  type: "string",
                  enum: ["slate", "purple", "emerald", "blue"],
                  description: "Primary color theme"
                }
              },
              required: ["bullet", "primaryColor"]
            }
          },
          required: ["name", "baseStyle", "customizations"]
        }
      }
    ],
    function_call: { name: "generateInterface" }
  });

  const result = JSON.parse(response.choices[0].message.function_call.arguments);
  
  // Combine the preset with customizations
  const config = {
    name: result.name,
    style: {
      ...STYLE_PRESETS[result.baseStyle],
      bullet: result.customizations.bullet
    },
    // Add any computed properties based on primaryColor
    primaryColor: result.customizations.primaryColor
  };

  return config;
}

async function analyzeCreatorVision(creatorData) {
  const prompt = `Analyze this creator's note-taking interface vision:
    Inspiration: ${creatorData.responses.inspiration}
    Desired Vibe: ${creatorData.responses.vibe}
    ${creatorData.responses.freeform ? `Additional Thoughts: ${creatorData.responses.freeform}` : ''}
    ${creatorData.responses.codeSnippets ? `Reference Code:\n${creatorData.responses.codeSnippets}` : ''}
    
    Identify:
    1. Core aesthetic direction
    2. Key interaction patterns
    3. Visual style elements
    4. Specific technical requirements or preferences based on provided code (if any)`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

async function analyzeSketch(sketchDataUrl) {
  const prompt = `Analyze this interface sketch/reference image. 
    Please identify:
    1. Layout patterns and structure
    2. Visual elements and their relationships
    3. Any specific UI components or features shown
    4. Color schemes or visual style indicators
    
    Focus on concrete, implementable details.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: sketchDataUrl
          }
        ],
      }
    ],
    max_tokens: 500,
  });

  return response.choices[0].message.content;
}

function validateTailwindClasses(classes) {
  // Basic validation - could be expanded
  const invalidChars = /[^a-zA-Z0-9-\s]/g;
  const commonPrefixes = ['bg-', 'text-', 'p-', 'm-', 'border-', 'rounded-', 'shadow-', 'hover:', 'focus:'];
  
  const classArray = classes.split(' ');
  return classArray.every(cls => {
    if (invalidChars.test(cls)) return false;
    return commonPrefixes.some(prefix => cls.startsWith(prefix));
  });
}

async function generateInterfaceConfig(analysis, sketchAnalysis) {
  const prompt = `Based on this analysis of the creator's vision and style:
    ${analysis}
    ${sketchAnalysis ? `And their sketch analysis: ${sketchAnalysis}` : ''}
    
    Generate a creator interface configuration in this exact JavaScript object format:
    {
      name: "Creator's name",
      vibe: "One-line description of the interface vibe",
      style: {
        container: "Tailwind classes for container",
        input: "Tailwind classes for input",
        entry: "Tailwind classes for entries",
        bullet: "Bullet character or symbol",
        entryText: "Tailwind classes for entry text",
        activeText: "Tailwind classes for active text",
        fadeText: "Tailwind classes for faded text"
      },
      features: {
        // 2-4 unique features that match their style
        // e.g. fadeOldEntries: true,
        // showOneAtATime: true,
        // etc.
      }
    }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function generateModeLabels(intention) {
  if (!intention || intention.length < 20) return null;

  const prompt = `As an empathetic AI assistant, analyze this user's intention: "${intention}"

Generate three supportive responses (5-8 words each) that would resonate with their current state:

1. A gentle phrase about processing thoughts/feelings
2. A supportive phrase about moving forward/organizing
3. A reassuring phrase about getting thoughts down quickly

Make each phrase feel like a supportive friend who's really listening.
Be personal and directly connect with their specific situation.
Return only the three phrases, one per line, without any labels or prefixes.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 150,
    presence_penalty: 0.6,
    frequency_penalty: 0.6
  });

  try {
    // Just split by newlines and take the first three non-empty lines
    const lines = response.choices[0].message.content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('For') && !line.startsWith('1.') && !line.startsWith('2.') && !line.startsWith('3.'))
      .slice(0, 3);

    return {
      reflection: lines[0],
      planning: lines[1],
      capture: lines[2]
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      reflection: modeVariations.reflection[Math.floor(Math.random() * modeVariations.reflection.length)],
      planning: modeVariations.planning[Math.floor(Math.random() * modeVariations.planning.length)],
      capture: modeVariations.capture[Math.floor(Math.random() * modeVariations.capture.length)]
    };
  }
} 