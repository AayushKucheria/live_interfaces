import React, { useEffect, useRef, useState } from 'react';
import { modelToLoopy, sendModelToLoopy } from '../utils/loopyUtils';

/**
 * Component to embed and interact with Loopy visualization tool
 * @param {Object} props Component props
 * @param {Object} props.model Optional model data that could be converted to Loopy format
 * @param {string} props.title Optional title for the visualization
 */
const LoopyVisualizer = ({ model, title }) => {
  const iframeRef = useRef(null);
  const [isLoopyReady, setIsLoopyReady] = useState(false);
  const [modelSent, setModelSent] = useState(false);
  
  // Setup message listener to communicate with Loopy iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Check if the message is from Loopy
      if (event.data && event.data.type === 'loopy_ready') {
        console.log('Loopy is ready for interaction');
        setIsLoopyReady(true);
        setModelSent(false); // Reset when Loopy is (re)loaded
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // If we have a model and Loopy is ready, convert it to Loopy format and send it
  useEffect(() => {
    if (model && isLoopyReady && iframeRef.current && !modelSent) {
      try {
        const loopyModel = modelToLoopy(model);
        sendModelToLoopy(loopyModel, iframeRef.current);
        console.log('Sent model to Loopy:', loopyModel);
        setModelSent(true); // Mark that we've sent the model
      } catch (error) {
        console.error('Error converting model to Loopy format:', error);
      }
    }
  }, [model, isLoopyReady, modelSent]);
  
  // Reset modelSent whenever the model changes
  useEffect(() => {
    setModelSent(false);
  }, [model]);

  return (
    <div className="loopy-visualizer h-full flex flex-col">
      {title && (
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        </div>
      )}
      
      <div className="flex-1 flex items-center justify-center overflow-auto relative">
        <iframe 
          ref={iframeRef}
          src="/loopy/v1.1/index.html" 
          className="absolute inset-0 w-full h-full border-0"
          title="Loopy Visualization Tool"
          allow="fullscreen"
        />
      </div>
    </div>
  );
};

export default LoopyVisualizer; 