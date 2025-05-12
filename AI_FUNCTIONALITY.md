# AI Functionality Documentation

This document provides a detailed overview of the AI functionality in the Live World Models application, including the refactored code structure.

## AI Integration Overview

The application leverages Claude AI (via OpenRouter API) to enable intelligent exploration, modification, and integration of causal models. The key AI features include:

### 1. Thread Generation and Exploration

**What are threads?**
- "Threads" are AI-generated suggestions for exploring and extending the current causal model
- They represent possible paths for model refinement or expansion
- Each thread contains exactly 3 specific suggestions with detailed explanations

**When threads are generated:**
- When switching to the "Integrate" view mode
- When the model is first loaded in the integrate view
- When the user explicitly requests a refresh by clicking the refresh button

**How threads work:**
- The application calls `generateThreadSuggestions(model)` from `aiThreadService.js`
- The current causal model is simplified and sent to Claude AI
- Claude analyzes the model structure and generates multiple exploration threads
- Each thread contains exactly 3 specific suggestions for model enhancement

**Thread generation process:**
```
User model → simplifyModelForAI() → Claude AI → Suggestion threads → UI display
```

**Thread implementation process:**
```
User selects suggestion → implementDetailedSuggestion() → Claude AI → Modified model → Visual update
```

**AI prompt structure:**
- The system prompt is concise and focused on generating high-quality thread suggestions
- Output is structured as JSON with threads and detailed suggestions
- Threads are categorized into three main types:
  1. Add new variables
  2. Increase relationship nuance
  3. Simplify while preserving dynamics

**Thread quality criteria:**
- Specific and directly relevant to the existing model
- Clearly explain interaction with existing variables
- Describe potential new dynamics that would emerge
- Domain-appropriate and realistic
- Implementable in a single step

**Implementation details:**
- When a user selects a specific suggestion, `implementDetailedSuggestion()` from `aiModelService.js`:
  - Sends the current model to Claude with the suggestion
  - Receives a modified model in response
  - Converts the response to Loopy format
  - Updates the visualization

### 2. Model Merging ("Steal" Functionality)

**What is "Steal"?**
- A feature that allows users to incorporate elements from one model into another
- Uses category theory concepts to merge models intelligently
- Applies a "functorial pushout" approach to integrate models

**When steal is triggered:**
- When clicking the "Steal" button on a model in the library
- When clicking "Steal" in the expanded model view

**How steal works:**
- Opens a merge modal requesting user feedback on what to merge
- Sends both models (current and target) to Claude with the user's feedback
- Claude applies category theory principles to merge the models
- Returns a new integrated model that preserves key properties of both

**Merge process:**
```
Current model + Target model + User feedback → Claude AI → Merged model → Model library
```

**AI prompt structure:**
- Uses `structuralCompositionSystemPrompt`, a detailed prompt instructing Claude on how to merge models
- Emphasizes structural preservation, conflict resolution, and applied category theory
- Includes a comprehensive JSON schema to ensure proper model structure
- Instructs Claude to output only valid JSON for the merged model

**Implementation details:**
- The `handleModelMergeWorkflow()` function in `aiModelService.js` orchestrates the process:
  - Prepares the models and feedback
  - Sends them to Claude
  - Processes the response
  - Adds the merged model to the library
  - Updates the UI

### 3. Model Translation (In Development)

**What is "Translate"?**
- A feature intended to translate models between different representations or formalisms
- The UI shows "Translate" buttons in both the model library and expanded model view
- Currently appears to be a placeholder feature with console logs but no full implementation

**Current status:**
- The interface includes "Translate" buttons that log messages to the console
- When clicked, these buttons log messages like `"Translate clicked for [model name]"`
- No actual translation functionality is implemented yet
- This suggests planned future work to convert models between different theoretical frameworks

## Refactored Code Structure

The AI functionality has been refactored into a more modular structure with clear separation of concerns:

### 1. Service Layer

**aiModelService.js**
- High-level orchestration of AI operations
- Combines model transformations with UI state updates
- Key functions:
  - `implementDetailedSuggestion()`: Handles the complete workflow for implementing a thread suggestion
  - `handleModelMergeWorkflow()`: Manages the entire model merging process

**modelTransformationService.js**
- Core transformation operations that interact with Claude AI
- Focused on the actual model transformations without UI concerns
- Key functions:
  - `implementSuggestion()`: Sends a model and suggestion to Claude and returns the transformed model
  - `mergeModels()`: Sends two models to Claude for merging
  - `prepareModelMerge()`: Handles UI state preparation for model merging

**aiThreadService.js**
- Handles thread suggestions generation
- Communicates with Claude to create exploration threads

**openRouterService.js**
- Low-level API communication with Claude via OpenRouter
- Manages API requests, responses, and error handling

### 2. Utility Layer

**modelFormatUtils.js**
- Utilities for converting between different model formats
- Key functions:
  - `simplifyModelForAI()`: Converts Loopy models to a simplified format for Claude
  - `convertToLoopyFormat()`: Transforms Claude's response back to Loopy format
  - `extractJSONFromResponse()`: Parses JSON from Claude's text responses

**loopyUtils.js**
- Utilities specific to the Loopy visualization format
- Helps with conversion to/from Loopy model format

**mermaidUtils.js**
- Utilities for generating and working with Mermaid diagrams
- Converts models to Mermaid format for visualization

**prompts.js**
- Contains system prompts used for different AI operations
- Centralizes prompt management for consistency

### 3. UI Components

**UnifiedInterface.jsx**
- Main component that coordinates all UI interactions
- Delegates complex operations to service layers
- Manages application state

**ModificationThreads Component**
- Displays and handles interaction with thread suggestions
- Uses service layer for actual implementation

## Technical Implementation

**API Integration:**
- Uses the OpenRouter API to access Claude AI models
- Default model is `anthropic/claude-3-sonnet:20240229`
- Supports request cancellation via AbortController
- API key must be set in `VITE_OPENROUTER_API_KEY` environment variable

**Model Simplification:**
- Uses `simplifyModelForAI()` function to convert complex model formats to a simplified representation
- Standardizes different model formats (Loopy, CatCoLab) into a consistent structure
- The simplified format focuses on essential elements:
  ```json
  {
    "nodes": ["Node Name 1", "Node Name 2", ...],
    "relationships": [
      {
        "from": "Node Name 1",
        "to": "Node Name 2",
        "effect": "positive" | "negative"
      }
    ]
  }
  ```

**Error Handling:**
- Service functions use proper try/catch blocks and return meaningful errors
- UI components display appropriate error messages
- API requests can be cancelled using AbortController
- Fallback mechanisms for when AI services fail

## Setup Requirements

The application requires an OpenRouter API key to function. This should be set in the environment variable:
```
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

Without this key, the AI functionality will not work. 