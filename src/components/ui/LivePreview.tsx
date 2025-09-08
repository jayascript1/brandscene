import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { TransitionWrapper } from './TransitionWrapper';
import { GeneratedScene } from '../../types';
import { ASPECT_RATIO_CLASSES } from '../../services/replicate';

interface LivePreviewProps {
  className?: string;
}

const LivePreview: React.FC<LivePreviewProps> = ({ className = '' }) => {
  const { state } = useAppContext();
  const { generatedScenes, generationRequest, formData } = state;
  
  // Get the aspect ratio class based on user's dimension selection
  const aspectRatioClass = ASPECT_RATIO_CLASSES[formData.brandInfo.imageDimensions];
  
  const isGenerating = generationRequest?.status === 'pending' || generationRequest?.status === 'processing';
  const hasScenes = generatedScenes.length > 0;
  
  // Don't show anything if not generating and no scenes
  if (!isGenerating && !hasScenes) {
    return null;
  }

  const renderScene = (scene: GeneratedScene, index: number) => (
    <TransitionWrapper 
      key={scene.id} 
      isVisible={true} 
      type="scale" 
      delay={index * 200}
    >
      <div className="bg-dark-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className={`${aspectRatioClass} relative`}>
          {scene.imageUrl ? (
            <img
              src={scene.imageUrl}
              alt={`Generated scene ${scene.sceneNumber}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-dark-700 flex items-center justify-center">
              <div className="text-center">
                <div className="text-dark-400 text-4xl mb-2">
                  {scene.status === 'error' ? '❌' : '⏳'}
                </div>
                <p className="text-dark-400 text-sm">
                  {scene.status === 'error' ? 'Generation Failed' : 'Generating...'}
                </p>
              </div>
            </div>
          )}
          <div className="absolute top-2 left-2 bg-dark-900 bg-opacity-80 rounded px-2 py-1">
            <span className="text-white text-sm font-medium">
              Scene {scene.sceneNumber}
            </span>
          </div>
          <div className={`absolute bottom-2 right-2 rounded px-2 py-1 ${
            scene.status === 'completed' ? 'bg-green-600 bg-opacity-90' :
            scene.status === 'generating' ? 'bg-yellow-600 bg-opacity-90' :
            'bg-red-600 bg-opacity-90'
          }`}>
            <span className="text-white text-xs">
              {scene.status === 'completed' ? '✓ Complete' :
               scene.status === 'generating' ? '⏳ Generating' :
               '❌ Error'}
            </span>
          </div>
        </div>
        <div className="p-3">
          <p className="text-dark-300 text-sm line-clamp-2">
            {scene.prompt}
          </p>
        </div>
      </div>
    </TransitionWrapper>
  );

  const renderPlaceholder = (sceneNumber: number) => (
    <div 
      key={`placeholder-${sceneNumber}`}
      className="bg-dark-800 rounded-lg overflow-hidden shadow-lg"
    >
      <div className={`${aspectRatioClass} relative bg-dark-700 flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2 mx-auto"></div>
          <span className="text-dark-400 text-sm">Generating...</span>
        </div>
        <div className="absolute top-2 left-2 bg-dark-900 bg-opacity-80 rounded px-2 py-1">
          <span className="text-white text-sm font-medium">
            Scene {sceneNumber}
          </span>
        </div>
      </div>
      <div className="p-3">
        <div className="h-4 bg-dark-700 rounded animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <section className={`${className}`} aria-labelledby="live-preview-heading">
      <TransitionWrapper isVisible={true} type="slide" delay={100}>
        <div className="text-center mb-6">
          <h2 id="live-preview-heading" className="text-2xl font-bold text-white mb-2">
            {isGenerating ? 'Generating Your Scenes' : 'Generated Scenes'}
          </h2>
          <p className="text-dark-300">
            {isGenerating 
              ? `${generatedScenes.length} of 4 scenes completed`
              : `${generatedScenes.length} scenes ready`
            }
          </p>
          {isGenerating && generationRequest?.progress && (
            <div className="mt-3 max-w-md mx-auto">
              <div className="bg-dark-700 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationRequest.progress}%` }}
                />
              </div>
              <p className="text-xs text-dark-400 mt-1">
                {Math.round(generationRequest.progress)}% complete
              </p>
            </div>
          )}
        </div>
      </TransitionWrapper>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Render completed scenes */}
        {generatedScenes.map((scene, index) => renderScene(scene, index))}
        
        {/* Render placeholders for remaining scenes */}
        {isGenerating && Array.from({ length: 4 - generatedScenes.length }, (_, index) => 
          renderPlaceholder(generatedScenes.length + index + 1)
        )}
      </div>

      {hasScenes && !isGenerating && (
        <TransitionWrapper isVisible={true} type="slide" delay={500}>
          <div className="text-center mt-6">
            <a 
              href="/results"
              className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
              aria-label="View all generated scenes in 3D carousel"
            >
              <span className="mr-2">🎬</span>
              View in 3D Carousel
            </a>
          </div>
        </TransitionWrapper>
      )}
    </section>
  );
};

export default LivePreview;