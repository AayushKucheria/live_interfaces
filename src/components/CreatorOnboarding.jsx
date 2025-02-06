import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft } from 'lucide-react';
import { processCreatorInput } from '../services/interfaceGenerator';

const CreatorOnboarding = () => {
  const navigate = useNavigate();
  const [responses, setResponses] = useState({
    inspiration: '',
    vibe: '',
    freeform: '',
    codeSnippets: '',
    sketch: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = await processCreatorInput({ responses });
      // TODO: Save the creator config
      navigate('/');
    } catch (error) {
      console.error('Error creating interface:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResponses(prev => ({
          ...prev,
          sketch: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-slate-600 hover:text-slate-800 
                     transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 
                               transition-transform" />
          Back to Main Interface
        </button>

        <h1 className="text-3xl font-bold text-slate-800 mb-8">
          Create Your Interface
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-xl shadow-sm p-8">
          {/* Inspiration Question */}
          <div className="space-y-4">
            <label className="block text-xl font-medium text-slate-800">
              What inspires your note-taking style?
            </label>
            <textarea
              value={responses.inspiration}
              onChange={(e) => setResponses(prev => ({
                ...prev,
                inspiration: e.target.value
              }))}
              placeholder="Share what makes your approach to capturing thoughts unique..."
              className="w-full h-32 p-4 text-lg bg-slate-50 rounded-lg 
                       border-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Vibe Question */}
          <div className="space-y-4">
            <label className="block text-xl font-medium text-slate-800">
              Describe the feeling you want your interface to evoke
            </label>
            <textarea
              value={responses.vibe}
              onChange={(e) => setResponses(prev => ({
                ...prev,
                vibe: e.target.value
              }))}
              placeholder="e.g., Zen garden, Creative workshop, Knowledge architect..."
              className="w-full h-32 p-4 text-lg bg-slate-50 rounded-lg 
                       border-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Freeform Thoughts */}
          <div className="space-y-4">
            <label className="block text-xl font-medium text-slate-800">
              Any other thoughts or specific requirements? (optional)
            </label>
            <textarea
              value={responses.freeform}
              onChange={(e) => setResponses(prev => ({
                ...prev,
                freeform: e.target.value
              }))}
              placeholder="Share any additional ideas, features, or requirements you have in mind..."
              className="w-full h-32 p-4 text-lg bg-slate-50 rounded-lg 
                       border-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Code Snippets */}
          <div className="space-y-4">
            <label className="block text-xl font-medium text-slate-800">
              Have any code snippets for reference? (optional)
            </label>
            <textarea
              value={responses.codeSnippets}
              onChange={(e) => setResponses(prev => ({
                ...prev,
                codeSnippets: e.target.value
              }))}
              placeholder="Paste any relevant code snippets here..."
              className="w-full h-48 p-4 text-lg bg-slate-50 rounded-lg font-mono
                       border-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Sketch Upload */}
          <div className="space-y-4">
            <label className="block text-xl font-medium text-slate-800">
              Upload a sketch or reference image (optional)
            </label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-48 
                              border-2 border-dashed border-slate-300 rounded-lg 
                              hover:border-emerald-500 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {responses.sketch ? (
                  <img 
                    src={responses.sketch} 
                    alt="Uploaded sketch" 
                    className="h-full w-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">
                      Click to upload an image
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-emerald-600 text-white text-lg font-medium
                       rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Create My Interface
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatorOnboarding; 