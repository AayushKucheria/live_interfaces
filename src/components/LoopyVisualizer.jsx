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
      
      // Handle CatColab export response
      if (event.data && event.data.action === 'exportCatColab' && event.data.data) {
        console.log('Main listener received CatColab export data');
        try {
          // Parse the CatColab model data
          const catColabData = JSON.parse(event.data.data);
          console.log('Parsed CatColab data in main listener:', catColabData);
          
          // Create a downloadable file
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(catColabData, null, 2));
          const downloadAnchorNode = document.createElement('a');
          downloadAnchorNode.setAttribute("href", dataStr);
          downloadAnchorNode.setAttribute("download", "loopy_export_catcolab.json");
          document.body.appendChild(downloadAnchorNode);
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
          console.log('Download triggered from main listener');
        } catch (error) {
          console.error('Error processing CatColab export data in main listener:', error);
        }
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

  // Function to handle exporting current Loopy model to CatColab format
  const handleExportToCatColab = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) {
      console.error('Iframe reference is not available');
      return;
    }
    
    console.log('Starting CatColab export process...');
    
    // Request the current model from Loopy - the response will be handled by the main event listener
    iframeRef.current.contentWindow.postMessage({
      action: 'requestExportCatColab'
    }, '*');
    console.log('Export request sent to Loopy iframe');
  };

  return (
    <div className="loopy-visualizer h-full flex flex-col">
      {title && (
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleExportToCatColab}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Export the current Loopy model to CatColab format"
            >
              Export to CatColab
            </button>
          </div>
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