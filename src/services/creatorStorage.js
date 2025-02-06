// Move default creators here
const defaultCreators = {
  jun: {
    name: "Jun Tanaka",
    vibe: "Digital Zen Garden",
    style: {
      container: "space-y-4 p-8 bg-gray-50",
      input: "w-full p-4 bg-transparent border-none focus:outline-none text-gray-800 text-lg font-serif placeholder:text-gray-400",
      entry: "flex items-start space-x-4 py-3",
      bullet: "•",
      entryText: "font-serif text-gray-600",
      activeText: "text-gray-900",
      fadeText: "text-gray-400"
    },
    features: {
      fadeOldEntries: true,
      showOneAtTime: true,
      gentleAnimations: true
    }
  },
  luna: {
    name: "Luna Martinez",
    vibe: "Your Creative Companion",
    style: {
      container: "space-y-4 p-6 bg-gradient-to-br from-purple-50 to-blue-50",
      input: "w-full p-4 rounded-xl bg-white/70 border-2 border-purple-200 focus:border-purple-400",
      entry: "flex items-start space-x-3 py-2",
      bullet: "✨",
      entryText: "text-purple-600",
      encouragement: "italic text-purple-400 text-sm mt-2"
    },
    features: {
      showEncouragement: true,
      playfulAnimations: true
    }
  },
  marcus: {
    name: "Marcus Chen",
    vibe: "Knowledge Architecture",
    style: {
      container: "space-y-4 p-6 bg-blue-50",
      input: "w-full p-4 rounded-lg bg-white/80 border-2 border-blue-200 focus:border-blue-400",
      entry: "flex items-start space-x-3 py-2",
      bullet: "→",
      entryText: "text-blue-800",
      tag: "inline-block px-2 py-1 mr-2 text-xs bg-blue-100 text-blue-700 rounded-full"
    },
    features: {
      autoTags: true,
      showConnections: true
    }
  }
};

// Simple in-memory storage for now
let creators = { ...defaultCreators };  // Initialize with defaults

export function saveCreator(id, creator) {
  creators[id] = creator;
}

export function getCreators() {
  return creators;
}

// For testing/development
export function resetCreators() {
  creators = { ...defaultCreators };
} 