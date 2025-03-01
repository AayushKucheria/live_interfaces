import React from 'react';

export default function ComponentSandbox({ Component }) {
  try {
    // Basic component validation
    if (typeof Component !== 'function') throw new Error('Invalid component');
    
    return (
      <div className="sandbox border rounded-lg p-4 my-4 bg-white">
        <React.Suspense fallback={<div>Loading...</div>}>
          <Component />
        </React.Suspense>
      </div>
    );
  } catch (error) {
    return (
      <div className="text-red-500 bg-red-50 p-3 rounded-lg">
        Component Error: {error.message}
      </div>
    );
  }
} 