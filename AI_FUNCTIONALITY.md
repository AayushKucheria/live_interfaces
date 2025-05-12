# AI Functionality Documentation

This document provides a detailed overview of the AI functionality in the Live World Models application.

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
User selects suggestion → handleDetailedSuggestionClick() → Claude AI → Modified model → Visual update
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
- When a user selects a specific suggestion, the function `handleDetailedSuggestionClick()` sends a request to Claude with:
  - The current model in simplified JSON format
  - The suggestion title and description
  - A request to implement the specific modification
- Claude returns a modified model with the changes implemented
- The model is converted to Loopy format and the visualization is updated
- Default threads are provided if API requests fail (fallback mechanism)

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
- The `handleMergeSubmit()` function processes the merge request
- Creates a new AbortController to allow cancellation of long-running requests
- Sends both models to Claude with user feedback
- Parses the response to extract the merged model
- Adds the new model to the library with a unique name
- Updates the UI to show the newly merged model
- Includes error handling for both API failures and JSON parsing issues

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

## Technical Implementation

**API Integration:**
- Uses the OpenRouter API to access Claude AI models
- Default model is `anthropic/claude-3-sonnet:20240229`
- Supports request cancellation via AbortController
- API key must be set in `VITE_OPENROUTER_API_KEY` environment variable

**Key Files:**
- `services/aiThreadService.js`: Handles thread generation and suggestion implementation
- `services/openRouterService.js`: Manages communication with Claude via OpenRouter
- `utils/prompts.js`: Contains system prompts for different AI operations
- `UnifiedInterface.jsx`: Main component that orchestrates AI interactions

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
- Includes detailed logging for debugging and verification
- Handles null/undefined models with appropriate defaults

**Prompts Used:**
- Concise system prompt in `aiThreadService.js`:
  - Provides clear quality criteria and examples of good suggestions
  - Requires exactly 3 suggestions per thread type
  - Includes examples with the right level of specificity
  
- `threadCompositionSystemPrompt`: Used for implementing specific thread suggestions
  - Provides instructions for modifying causal loop diagrams based on user feedback
  - Contains details about JSON structure and expected output format
  
- `structuralCompositionSystemPrompt`: Used for merging models (steal functionality)
  - Includes detailed instructions on applying category theory for model merging
  - Contains a complete JSON schema for model validation

**Error Handling:**
- Fallback to default suggestions if Claude API requests fail
- JSON parsing with multiple fallback strategies
- Request cancellation support for merging operations
- User feedback during loading states
- Detailed logging for debugging

## Setup Requirements

The application requires an OpenRouter API key to function. This should be set in the environment variable:
```
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

Without this key, the AI functionality will not work.

## Technical Notes

- The application uses a simplified format when sending models to Claude to reduce token usage
- Models are parsed and converted between different formats (Loopy, JSON, etc.)
- Error handling includes fallbacks for API failures and JSON parsing issues
- The UI provides loading indicators during AI operations
- The application uses React hooks and memoization for performance optimization
- Global references are used to enable communication between components
- The visualization supports real-time updates as models are modified 