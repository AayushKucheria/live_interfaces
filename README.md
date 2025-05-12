# Live World Models

An interactive tool for visualizing, exploring, and manipulating causal models with AI assistance. Live World Models allows users to create, merge, and explore theoretical models dynamically.

## Features

- **Interactive Causal Models**: Create and manipulate causal loop diagrams with an intuitive interface
- **AI-Assisted Exploration**: Use Claude AI to suggest model improvements and extensions
- **Model Library**: Browse and integrate existing models from different domains
- **Theory Integration**: Merge models intelligently using applied category theory principles
- **Multiple Visualization Formats**: View models as interactive simulations or structured diagrams
- **Exploration Threads**: Pull on specific aspects of a model to see how it can evolve

## Architecture

The application is structured around these key components:

- **Visualization Engine**: Based on a customized Loopy implementation
- **AI Integration**: Claude AI (via OpenRouter) for intelligent model manipulation
- **React Frontend**: Modern React with hooks for the user interface
- **Service Layer**: Modular services handling model transformations and AI operations

## Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn
- An OpenRouter API key for Claude AI access

### Environment Setup

1. Create a `.env` file in the root directory
2. Add your OpenRouter API key:
   ```
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

### Clone the repository with submodules

```bash
git clone https://github.com/yourusername/live_theory1.git
cd live_theory1
git submodule update --init --recursive
```

We use a customized fork of the Loopy visualization tool that includes additional features like:
- Mouse wheel zooming
- Sidebar minimization
- UI improvements

The customized version is automatically included when you initialize the submodules.

### Install dependencies

```bash
npm install
# or
yarn
```

## Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173` (or your configured port).

### Project Structure

```
src/
├── components/        # React components
├── services/          # Service layer for AI and model operations
├── utils/             # Utility functions and helpers
├── assets/            # Static assets
└── models/            # Example model definitions
```

### Key Service Files

- **aiModelService.js**: High-level AI operations that combine model transformations with UI updates
- **modelTransformationService.js**: Core model transformation operations
- **aiThreadService.js**: Thread suggestion generation services
- **openRouterService.js**: Communication with Claude AI via OpenRouter

### Key Utility Files

- **modelFormatUtils.js**: Convert between different model formats
- **loopyUtils.js**: Utilities for the Loopy visualization format
- **mermaidUtils.js**: Generate and process Mermaid diagrams
- **jsonModelLoader.js**: Load and manage model library
- **prompts.js**: System prompts for AI operations

## User Interface

The application offers three main view modes:

1. **Focus**: Concentrate on a single model without distractions
2. **Integrate**: Work with AI suggestions to expand and refine your model
3. **Explore**: Browse the model library and discover new models to integrate

## Technology Stack

- **Frontend**: React, TailwindCSS
- **Visualization**: Custom Loopy implementation, Mermaid.js
- **AI**: Claude 3 Sonnet (via OpenRouter)
- **Build Tools**: Vite

## Contributing

[Instructions for contributors would go here]

## License

[License information would go here] 