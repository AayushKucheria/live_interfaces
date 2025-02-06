import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function processCreatorInput(creatorData) {
  // First, analyze the creator's responses to understand their vision
  const analysis = await analyzeCreatorVision(creatorData);
  
  // If there's a sketch, analyze it
  let sketchAnalysis = '';
  if (creatorData.responses.sketch) {
    sketchAnalysis = await analyzeSketch(creatorData.responses.sketch);
  }
  
  // Then, generate interface configuration based on both analyses
  const interfaceConfig = await generateInterfaceConfig(analysis, sketchAnalysis);
  
  return interfaceConfig;
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

async function generateInterfaceConfig(analysis, sketchAnalysis = '') {
  const prompt = `Based on this analysis of a creator's vision:
    ${analysis}
    
    ${sketchAnalysis ? `And this analysis of their sketch/reference image:
    ${sketchAnalysis}` : ''}
    
    Generate a complete interface configuration including:
    1. Color scheme and visual style
    2. Animation preferences
    3. Layout structure (incorporating any specific layout from the sketch)
    4. Interactive features
    5. Feedback mechanisms
    
    Format the response as a valid JavaScript object matching our creator interface schema.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content);
} 