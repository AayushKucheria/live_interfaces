import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateModeLabels(intention) {
  if (!intention || intention.length < 20) return null;

  const prompt = `As an empathetic AI assistant, analyze this user's intention: "${intention}"

Generate three gentle, action-oriented phrases (5-8 words each) that would guide them towards:

1. A reflective phrase inviting them to process thoughts/feelings (e.g. "Let's explore what's on your mind")
2. A planning phrase suggesting organization/next steps (e.g. "Map out your path, one step forward")
3. A quick-capture phrase encouraging immediate expression (e.g. "Pour your thoughts out, just as they come")

Make each phrase feel like a supportive friend offering gentle guidance.
Connect with their specific situation and emotional state.
Use active verbs while maintaining a soft, encouraging tone.
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

// Update the fallback variations to be more action-oriented
const modeVariations = {
  reflection: [
    "Let's explore what's on your mind",
    "Take a moment to process together",
    "Gently unpack your thoughts here",
    "Create space for your reflections",
    "Let's understand this together"
  ],
  planning: [
    "Map out your next steps",
    "Build your path, piece by piece",
    "Shape your ideas into action",
    "Let's organize your way forward",
    "Break this down into small steps"
  ],
  capture: [
    "Pour your thoughts onto the page",
    "Catch your ideas as they flow",
    "Get it all out, just as it comes",
    "Start writing, no filters needed",
    "Let your thoughts flow freely here"
  ]
}; 