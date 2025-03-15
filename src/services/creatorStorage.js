// Default creators with minimal styling
const defaultCreators = {
  jun: {
    name: "Jun Tanaka",
    vibe: "Causal Loop Visualization",
    style: {
      container: "space-y-4 p-8 bg-blue-50 border border-blue-200 rounded-lg",
      input: "w-full p-4 bg-white/80 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none",
      entry: "flex items-start space-x-4 py-3 relative",
      bullet: "▲", // Triangle symbol to represent direction/relationship
      entryText: "text-slate-700",
      relation: "text-xs text-slate-500 mt-1 italic",
      // Add custom styling for visualizing relationships
      networkGraph: "mt-6 p-4 bg-white/90 rounded-lg shadow-sm border border-blue-100"
    },
    features: {
      fadeOldEntries: true,
      showOneAtTime: false,
      // Add new features related to causal model
      showRelationships: true,
      causalModel: {
        objects: [
          { id: "wolves", name: "wolves" },
          { id: "chickens", name: "chickens" }
        ],
        morphisms: [
          { 
            type: "Negative", 
            from: "wolves", 
            to: "chickens", 
            label: "predation" 
          },
          { 
            type: "Hom", 
            from: "chickens", 
            to: "wolves", 
            label: "food source" 
          }
        ]
      },
      modelData: {
        name: "",
        theory: "causal-loop",
        type: "model",
        notebook: {
          cells: [
            {
              tag: "formal",
              id: "01959aaf-9f97-741c-b80c-950548aa2194",
              content: {
                tag: "object",
                id: "01959aaf-9f97-741c-b80c-93ad3f4425e2",
                name: "wolves",
                obType: {
                  tag: "Basic",
                  content: "Object"
                }
              }
            },
            {
              tag: "formal",
              id: "01959aaf-e453-77aa-8fda-a552e9bcc5cd",
              content: {
                tag: "object",
                id: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6",
                name: "chickens",
                obType: {
                  tag: "Basic",
                  content: "Object"
                }
              }
            },
            {
              tag: "formal",
              id: "01959ab0-8d75-72c5-9b82-6fecc669b92f",
              content: {
                tag: "morphism",
                id: "01959ab0-8d75-72c5-9b82-690ecf134770",
                name: "",
                morType: {
                  tag: "Basic",
                  content: "Negative"
                },
                dom: {
                  tag: "Basic",
                  content: "01959aaf-9f97-741c-b80c-93ad3f4425e2"
                },
                cod: {
                  tag: "Basic",
                  content: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6"
                }
              }
            },
            {
              tag: "formal",
              id: "01959ab0-dcac-7588-b156-3296c765117e",
              content: {
                tag: "morphism",
                id: "01959ab0-dcac-7588-b156-2fb7ac287286",
                name: "",
                morType: {
                  tag: "Hom",
                  content: {
                    tag: "Basic",
                    content: "Object"
                  }
                },
                dom: {
                  tag: "Basic",
                  content: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6"
                },
                cod: {
                  tag: "Basic",
                  content: "01959aaf-9f97-741c-b80c-93ad3f4425e2"
                }
              }
            }
          ]
        }
      }
    }
  },
  luna: {
    name: "Luna Martinez",
    vibe: "Creative Ecosystem Map",
    style: {
      container: "space-y-4 p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg",
      input: "w-full p-4 rounded-xl bg-white/70 border border-purple-200 focus:ring-2 focus:ring-purple-400 focus:outline-none",
      entry: "flex items-start space-x-3 py-2",
      bullet: "✨",
      entryText: "text-purple-600",
      encouragement: "italic text-sm mt-2",
      // Add custom styling for visualizing creative ecosystem
      networkGraph: "mt-6 p-4 bg-white/80 rounded-xl shadow-sm border border-purple-200"
    },
    features: {
      showEncouragement: true,
      // Add new features related to the complete ecosystem model
      showCreativeEcosystem: true,
      causalModel: {
        objects: [
          { id: "wolves", name: "wolves" },
          { id: "chickens", name: "chickens" },
          { id: "worms", name: "worms" }
        ],
        morphisms: [
          { 
            type: "Negative", 
            from: "wolves", 
            to: "chickens", 
            label: "predation" 
          },
          { 
            type: "Hom", 
            from: "chickens", 
            to: "wolves", 
            label: "food source" 
          },
          { 
            type: "Negative", 
            from: "chickens", 
            to: "worms", 
            label: "predation" 
          },
          { 
            type: "Hom", 
            from: "worms", 
            to: "chickens", 
            label: "food source" 
          },
          { 
            type: "Negative", 
            from: "worms", 
            to: "wolves", 
            label: "parasites" 
          }
        ]
      },
      modelData: {
        name: "",
        notebook: {
          cells: [
            {
              tag: "formal",
              id: "01959aaf-9f97-741c-b80c-950548aa2194",
              content: {
                tag: "object",
                id: "01959aaf-9f97-741c-b80c-93ad3f4425e2",
                name: "wolves",
                obType: {
                  tag: "Basic",
                  content: "Object"
                }
              }
            },
            {
              tag: "formal",
              id: "01959aaf-e453-77aa-8fda-a552e9bcc5cd",
              content: {
                tag: "object",
                id: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6",
                name: "chickens",
                obType: {
                  tag: "Basic",
                  content: "Object"
                }
              }
            },
            {
              tag: "formal",
              id: "01959afb-c2dd-714d-aa11-b5734b48ed84",
              content: {
                tag: "object",
                id: "01959afb-c2dd-714d-aa11-b2a68104300b",
                name: "worms",
                obType: {
                  tag: "Basic",
                  content: "Object"
                }
              }
            },
            {
              tag: "formal",
              id: "01959ab0-8d75-72c5-9b82-6fecc669b92f",
              content: {
                tag: "morphism",
                id: "01959ab0-8d75-72c5-9b82-690ecf134770",
                name: "",
                morType: {
                  tag: "Basic",
                  content: "Negative"
                },
                dom: {
                  tag: "Basic",
                  content: "01959aaf-9f97-741c-b80c-93ad3f4425e2"
                },
                cod: {
                  tag: "Basic",
                  content: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6"
                }
              }
            },
            {
              tag: "formal",
              id: "01959ab0-dcac-7588-b156-3296c765117e",
              content: {
                tag: "morphism",
                id: "01959ab0-dcac-7588-b156-2fb7ac287286",
                name: "",
                morType: {
                  tag: "Hom",
                  content: {
                    tag: "Basic",
                    content: "Object"
                  }
                },
                dom: {
                  tag: "Basic",
                  content: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6"
                },
                cod: {
                  tag: "Basic",
                  content: "01959aaf-9f97-741c-b80c-93ad3f4425e2"
                }
              }
            },
            {
              tag: "formal",
              id: "01959afb-e434-7072-9395-acf3d69fb9fc",
              content: {
                tag: "morphism",
                id: "01959afb-e434-7072-9395-a9fed9e80edc",
                name: "",
                morType: {
                  tag: "Basic",
                  content: "Negative"
                },
                dom: {
                  tag: "Basic",
                  content: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6"
                },
                cod: {
                  tag: "Basic",
                  content: "01959afb-c2dd-714d-aa11-b2a68104300b"
                }
              }
            },
            {
              tag: "formal",
              id: "01959afc-4fc7-737d-b255-20beb06a96ce",
              content: {
                tag: "morphism",
                id: "01959afc-4fc7-737d-b255-1c497e97b7ce",
                name: "",
                morType: {
                  tag: "Hom",
                  content: {
                    tag: "Basic",
                    content: "Object"
                  }
                },
                dom: {
                  tag: "Basic",
                  content: "01959afb-c2dd-714d-aa11-b2a68104300b"
                },
                cod: {
                  tag: "Basic",
                  content: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6"
                }
              }
            },
            {
              tag: "formal",
              id: "01959afe-e5e2-7550-a285-598070a2dc6c",
              content: {
                tag: "morphism",
                id: "01959afe-e5e2-7550-a285-56f19c67ca04",
                name: "",
                morType: {
                  tag: "Basic",
                  content: "Negative"
                },
                dom: {
                  tag: "Basic",
                  content: "01959afb-c2dd-714d-aa11-b2a68104300b"
                },
                cod: {
                  tag: "Basic",
                  content: "01959aaf-9f97-741c-b80c-93ad3f4425e2"
                }
              }
            }
          ]
        },
        theory: "causal-loop",
        type: "model"
      }
    }
  },
  marcus: {
    name: "Marcus Chen",
    vibe: "Extended Causal Network",
    style: {
      container: "space-y-4 p-6 bg-indigo-50 border border-indigo-200 rounded-lg",
      input: "w-full p-4 rounded-lg bg-white/80 border border-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none",
      entry: "flex items-start space-x-3 py-2",
      bullet: "◆", // Diamond symbol to represent network nodes
      entryText: "text-indigo-800",
      tag: "inline-block px-2 py-1 mr-2 text-xs bg-indigo-100 text-indigo-700 rounded-full",
      connection: "text-xs text-indigo-500 mt-1 italic",
      // Add custom styling for visualizing complex relationships
      networkGraph: "mt-6 p-4 bg-white/90 rounded-lg shadow-sm border border-indigo-100"
    },
    features: {
      autoTags: true,
      showConnections: true,
      // Add new features related to the extended causal model
      showComplexNetwork: true,
      causalModel: {
        objects: [
          { id: "wolves", name: "wolves" },
          { id: "chickens", name: "chickens" },
          { id: "worms", name: "worms" }
        ],
        morphisms: [
          { 
            type: "Negative", 
            from: "wolves", 
            to: "chickens", 
            label: "predation" 
          },
          { 
            type: "Hom", 
            from: "chickens", 
            to: "wolves", 
            label: "food source" 
          },
          { 
            type: "Negative", 
            from: "chickens", 
            to: "worms", 
            label: "predation" 
          },
          { 
            type: "Hom", 
            from: "worms", 
            to: "chickens", 
            label: "food source" 
          }
        ]
      },
      modelData: {
        name: "",
        notebook: {
          cells: [
            {
              tag: "formal",
              id: "01959aaf-9f97-741c-b80c-950548aa2194",
              content: {
                tag: "object",
                id: "01959aaf-9f97-741c-b80c-93ad3f4425e2",
                name: "wolves",
                obType: {
                  tag: "Basic",
                  content: "Object"
                }
              }
            },
            {
              tag: "formal",
              id: "01959aaf-e453-77aa-8fda-a552e9bcc5cd",
              content: {
                tag: "object",
                id: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6",
                name: "chickens",
                obType: {
                  tag: "Basic",
                  content: "Object"
                }
              }
            },
            {
              tag: "formal",
              id: "01959afb-c2dd-714d-aa11-b5734b48ed84",
              content: {
                tag: "object",
                id: "01959afb-c2dd-714d-aa11-b2a68104300b",
                name: "worms",
                obType: {
                  tag: "Basic",
                  content: "Object"
                }
              }
            },
            {
              tag: "formal",
              id: "01959ab0-8d75-72c5-9b82-6fecc669b92f",
              content: {
                tag: "morphism",
                id: "01959ab0-8d75-72c5-9b82-690ecf134770",
                name: "",
                morType: {
                  tag: "Basic",
                  content: "Negative"
                },
                dom: {
                  tag: "Basic",
                  content: "01959aaf-9f97-741c-b80c-93ad3f4425e2"
                },
                cod: {
                  tag: "Basic",
                  content: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6"
                }
              }
            },
            {
              tag: "formal",
              id: "01959ab0-dcac-7588-b156-3296c765117e",
              content: {
                tag: "morphism",
                id: "01959ab0-dcac-7588-b156-2fb7ac287286",
                name: "",
                morType: {
                  tag: "Hom",
                  content: {
                    tag: "Basic",
                    content: "Object"
                  }
                },
                dom: {
                  tag: "Basic",
                  content: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6"
                },
                cod: {
                  tag: "Basic",
                  content: "01959aaf-9f97-741c-b80c-93ad3f4425e2"
                }
              }
            },
            {
              tag: "formal",
              id: "01959afb-e434-7072-9395-acf3d69fb9fc",
              content: {
                tag: "morphism",
                id: "01959afb-e434-7072-9395-a9fed9e80edc",
                name: "",
                morType: {
                  tag: "Basic",
                  content: "Negative"
                },
                dom: {
                  tag: "Basic",
                  content: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6"
                },
                cod: {
                  tag: "Basic",
                  content: "01959afb-c2dd-714d-aa11-b2a68104300b"
                }
              }
            },
            {
              tag: "formal",
              id: "01959afc-4fc7-737d-b255-20beb06a96ce",
              content: {
                tag: "morphism",
                id: "01959afc-4fc7-737d-b255-1c497e97b7ce",
                name: "",
                morType: {
                  tag: "Hom",
                  content: {
                    tag: "Basic",
                    content: "Object"
                  }
                },
                dom: {
                  tag: "Basic",
                  content: "01959afb-c2dd-714d-aa11-b2a68104300b"
                },
                cod: {
                  tag: "Basic",
                  content: "01959aaf-e453-77aa-8fda-a1fbea4ff0a6"
                }
              }
            }
          ]
        },
        theory: "causal-loop",
        type: "model"
      }
    }
  }
};

// Simple in-memory storage for now
let creators = { ...defaultCreators };  // Initialize with defaults

export function getCreators() {
  return creators;
}

// For testing/development
export function resetCreators() {
  creators = { ...defaultCreators };
} 