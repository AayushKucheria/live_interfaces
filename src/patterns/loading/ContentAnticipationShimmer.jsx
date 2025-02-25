import React, { useState } from 'react';

const ContentAnticipationShimmer = ({ 
  isLoading = false, 
  children, 
  className = "", 
  shimmerCount = 3,
  shimmerLayout = "default",
  ...props 
}) => {
  const renderShimmerItems = () => {
    if (shimmerLayout === "card") {
      return Array.from({ length: shimmerCount }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg overflow-hidden">
          <div className="h-32 bg-slate-200 w-full"></div>
          <div className="p-4">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      ));
    }
    
    // Default text-like layout
    return Array.from({ length: shimmerCount }).map((_, i) => (
      <div key={i} className="animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
    ));
  };
  
  return (
    <div className={`content-anticipation-shimmer ${className}`} {...props}>
      {isLoading ? (
        <div className="space-y-4">
          {renderShimmerItems()}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

// Attach metadata as a property
ContentAnticipationShimmer.metadata = {
  title: "Content Anticipation Shimmer",
  description: "Shows a placeholder animation while content is loading",
  category: "loading"
};

// Example usage
ContentAnticipationShimmer.Example = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  const toggleLoading = () => {
    setIsLoading(prev => !prev);
  };
  
  return (
    <div className="space-y-4">
      <ContentAnticipationShimmer isLoading={isLoading}>
        <div className="space-y-3">
          <p className="font-medium">Content is loaded!</p>
          <p>This is the actual content that appears after loading completes.</p>
          <p>It replaces the shimmer effect when data is ready.</p>
        </div>
      </ContentAnticipationShimmer>
      
      <div className="mt-4">
        <button 
          onClick={toggleLoading}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors"
        >
          {isLoading ? "Show Content" : "Show Loading State"}
        </button>
      </div>
    </div>
  );
};

export default ContentAnticipationShimmer; 