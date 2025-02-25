// This file exports all patterns for easy imports elsewhere
import FadeWithContext from './minimalist/FadeWithContext';
// import FocusedEntry from './minimalist/FocusedEntry';
import EncouragementFeedback from './creative/EncouragementFeedback';
// import PlayfulInteraction from './creative/PlayfulInteraction';
import AutoTagging from './structured/AutoTagging';
// import ConnectionVisualization from './structured/ConnectionVisualization';

// Import new patterns
import DirectionalFocus from './navigation/DirectionalFocus';
import ContentAnticipationShimmer from './loading/ContentAnticipationShimmer';
import MicroInteractionFeedback from './feedback/MicroInteractionFeedback';
import ComposedPatterns from './composed/ComposedPatterns';

// Export all patterns directly so they can be dynamically listed
export {
  FadeWithContext,
  // FocusedEntry,
  EncouragementFeedback,
  // PlayfulInteraction,
  AutoTagging,
  // ConnectionVisualization,
  DirectionalFocus,
  ContentAnticipationShimmer,
  MicroInteractionFeedback,
  ComposedPatterns
};

// Map patterns to creators - update to only include implemented patterns
export const creatorPatterns = {
  jun: ['FadeWithContext', 'ContentAnticipationShimmer'],
  luna: ['EncouragementFeedback', 'MicroInteractionFeedback'],
  marcus: ['AutoTagging', 'DirectionalFocus'],
  composed: ['ComposedPatterns'] // Add a new "creator" for composed examples
}; 