import React from 'react';

export class ErrorBoundary extends React.Component {
  state = { error: null }
  
  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <h3 className="font-medium">Component Error</h3>
          <pre className="mt-2 text-sm">{this.state.error.message}</pre>
          <button 
            className="mt-2 text-red-900 underline"
            onClick={() => this.setState({ error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
} 