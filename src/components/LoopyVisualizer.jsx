import React, { useEffect, useRef, useState } from 'react';
import { modelToLoopy, sendModelToLoopy } from '../utils/loopyUtils';
import { addModelToLibrary } from '../utils/jsonModelLoader';

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [modelName, setModelName] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [currentCatColabModel, setCurrentCatColabModel] = useState(null);
  
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
          
          // Store the model data for sharing
          setCurrentCatColabModel(catColabData);
          
          // If this was triggered by the Share button, show modal
          if (event.data.shareRequested) {
            setShowShareModal(true);
          } else {
            // Else trigger a download as before
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(catColabData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "loopy_export_catcolab.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            console.log('Download triggered from main listener');
          }
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

  // Function to handle sharing the model with others
  const handleShareWithOthers = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) {
      console.error('Iframe reference is not available');
      return;
    }
    
    console.log('Starting share model process...');
    
    // Request the current model from Loopy with share flag
    iframeRef.current.contentWindow.postMessage({
      action: 'requestExportCatColab',
      shareRequested: true
    }, '*');
    console.log('Share request sent to Loopy iframe');
  };

  // Function to handle submitting the share modal
  const handleShareSubmit = () => {
    if (!currentCatColabModel) {
      console.error('No model data available');
      return;
    }

    // Use user-provided name or generate a timestamp-based name
    const name = modelName.trim() || `Shared_Model_${new Date().toLocaleString().replace(/[/,:]/g, '_')}`;
    
    // Add model to the library
    const filename = addModelToLibrary(currentCatColabModel, name);
    console.log(`Model "${filename}" added to library`);
    
    // Show success message and reset form
    setShareSuccess(true);
    setTimeout(() => {
      setShowShareModal(false);
      setShareSuccess(false);
      setModelName('');
    }, 2000);
  };

  return (
    <div className="loopy-visualizer h-full flex flex-col">
      {title && (
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleShareWithOthers}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              title="Share this model with others by adding it to the library"
            >
              Share with Others
            </button>
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

      {/* Share Model Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {shareSuccess ? 'Model Shared Successfully!' : 'Share Your Model'}
            </h3>
            
            {!shareSuccess ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Give your model a name so others can find it in the library.
                </p>
                
                <div className="mb-4">
                  <label htmlFor="model-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Model Name
                  </label>
                  <input
                    type="text"
                    id="model-name"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="My Awesome Model"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowShareModal(false);
                      setModelName('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShareSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Share Model
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-green-600">
                Your model has been added to the library and is now available for others to use!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoopyVisualizer; 