# Live World Models: Architecture Documentation

## Overview

Live World Models is a React application designed for creating, visualizing, and analyzing causal loop diagrams and system models. It provides an interactive interface for users to explore complex systems through different visualization methods, leveraging AI to enhance model creation and composition.

## Tech Stack

- **Frontend**: React (v18.2.0) with Vite as the build tool
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **Diagramming**: Mermaid (for static visualizations) and custom Loopy visualizer (for interactive models)
- **AI Integration**: OpenAI API integration via OpenRouter

## Project Structure

```
.
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── LoopyVisualizer.jsx    # Interactive node-based model editor
│   │   ├── MermaidDiagram.jsx     # Static diagram visualization
│   │   └── ModelVisualizer.jsx    # Component for model visualization
│   ├── json_models/      # Pre-defined system models in JSON format
│   ├── services/         # API and external service integrations
│   │   ├── aiThreadService.js     # AI-assisted thread generation
│   │   └── openRouterService.js   # Integration with OpenRouter API
│   ├── utils/            # Utility functions and helpers
│   │   ├── jsonModelLoader.js     # JSON model loading and management
│   │   ├── loopyUtils.js          # Utilities for Loopy visualization
│   │   ├── mermaidUtils.js        # Utilities for Mermaid visualization
│   │   └── prompts.js             # System prompts for AI integration
│   ├── App.jsx           # Main application component with routing
│   ├── UnifiedInterface.jsx # Primary interface combining visualizations and controls
│   ├── index.css         # Global styles
│   └── main.jsx          # Application entry point
└── package.json          # Project dependencies and scripts
```

## Key Components

### 1. UnifiedInterface (src/UnifiedInterface.jsx)

The main application interface which combines:
- A landing page for new users
- Model browsing and creation tools
- Visualization modes (Loopy and Mermaid)
- Model modification and merging capabilities
- AI-assisted thread generation for model enhancement

### 2. Visualization Components

#### LoopyVisualizer (src/components/LoopyVisualizer.jsx)
- Interactive node-based editor for creating and modifying causal loop diagrams
- Supports drag-and-drop interactions, node creation, and edge connections
- Visualizes feedback loops dynamically

#### MermaidDiagram (src/components/MermaidDiagram.jsx)
- Static diagram rendering using the Mermaid library
- Used for more formal, presentation-ready visualizations of models

### 3. AI Integration

#### aiThreadService (src/services/aiThreadService.js)
- Generates thread suggestions for model modifications and enhancements
- Uses pre-defined system prompts to guide AI responses

#### openRouterService (src/services/openRouterService.js)
- Manages communication with OpenAI's API via OpenRouter
- Handles message formatting and response parsing

### 4. Utility Functions

#### jsonModelLoader (src/utils/jsonModelLoader.js)
- Manages loading, parsing, and saving JSON model data
- Handles model format conversion and validation

#### mermaidUtils (src/utils/mermaidUtils.js)
- Converts internal model representations to Mermaid diagram syntax
- Handles diagram styling and formatting

#### loopyUtils (src/utils/loopyUtils.js)
- Utilities for the Loopy visualization engine
- Manages conversion between internal model format and Loopy format

## Data Flow

1. **Model Creation/Loading**:
   - Models can be created from scratch via the LoopyVisualizer
   - Pre-defined models can be loaded from the json_models directory
   - Models can be imported or merged from external sources

2. **Model Visualization**:
   - Internal model representation can be visualized using either Loopy (interactive) or Mermaid (static)
   - Conversion utilities (loopyUtils.js and mermaidUtils.js) handle translation between formats

3. **AI-Enhanced Model Modification**:
   - Users can request AI-generated suggestions via the ModificationThreads component
   - Suggestions are generated based on the current model context and system prompts
   - Users can accept, modify, or reject AI suggestions

4. **Model Composition**:
   - Models can be merged using category theory principles
   - AI assistance helps identify overlapping concepts and optimal integration points

## Key Design Patterns

1. **Component-Based Architecture**:
   - Modular React components with well-defined responsibilities
   - Separation of concerns between visualization, data management, and UI

2. **State Management**:
   - Local React state using useState for component-specific state
   - Props passing for component communication
   - Context (potentially) for global state management

3. **Service Layer**:
   - Abstracted API communication through service modules
   - Clear separation between UI and external service integration

4. **Utility Functions**:
   - Helper functions organized by domain (model loading, visualization conversion)
   - Reusable across different components

## Notable Features

1. **Interactive Visualization Engine** (LoopyVisualizer)
   - Dynamic node-based editor with real-time feedback
   - Supports various visualization modes and styles

2. **AI-Assisted Model Creation and Enhancement**
   - Integration with Claude/OpenAI for intelligent model suggestions
   - Helps users identify model improvements and structural patterns

3. **Model Composition with Category Theory**
   - Applies category theory principles to model merging
   - Supports complex system analysis through composition

4. **Dual Visualization Modes**
   - Interactive (Loopy) for exploration and creation
   - Static (Mermaid) for documentation and presentation

## Enhancement Opportunities

1. **Collaborative Editing**:
   - Real-time collaboration features for team model creation
   - Version control and change tracking

2. **Advanced AI Integration**:
   - More sophisticated model analysis and suggestion capabilities
   - Automated model validation and improvement recommendations

3. **Additional Visualization Methods**:
   - Support for other diagram types (sequence, class, etc.)
   - 3D visualization options for complex models

4. **Data Import/Export**:
   - Support for additional file formats
   - Integration with other modeling tools and formats 