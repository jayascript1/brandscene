import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ThreeCarousel } from './ThreeCarousel';
import { KeyboardNavigation } from '../ui';
import { measurePerformance, debounce } from '../../utils/performance';

interface SceneCarouselProps {
  className?: string;
}

const SceneCarousel: React.FC<SceneCarouselProps> = ({ className = '' }) => {
  const { state } = useAppContext();
  const { generatedScenes } = state;
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  // Memoized scene selection handler with performance tracking
  const handleSceneSelect = useCallback((scene: any, index: number) => {
    measurePerformance('scene-selection', () => {
      console.log(`Selected scene ${index + 1}:`, scene);
      setCurrentSceneIndex(index);
    });
  }, []);

  // Debounced navigation handler for better performance
  const handleNavigate = useCallback(
    debounce((direction: 'prev' | 'next') => {
      measurePerformance('scene-navigation', () => {
        if (direction === 'prev') {
          setCurrentSceneIndex(prev => prev > 0 ? prev - 1 : generatedScenes.length - 1);
        } else {
          setCurrentSceneIndex(prev => prev < generatedScenes.length - 1 ? prev + 1 : 0);
        }
      });
    }, 100),
    [generatedScenes.length]
  );

  const handleSelect = useCallback(() => {
    measurePerformance('scene-select-action', () => {
      console.log('Scene selected:', generatedScenes[currentSceneIndex]);
    });
  }, [currentSceneIndex, generatedScenes]);

  // Memoized carousel configuration for better performance
  const carouselConfig = useMemo(() => ({
    radius: 8,
    height: 0,
    rotationSpeed: 0.02,
    autoRotate: false
  }), []);



  if (generatedScenes.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 sm:h-96 bg-dark-800 rounded-lg ${className}`}>
        <div className="text-center text-dark-400 p-6">
          <div className="text-4xl sm:text-6xl mb-4" role="img" aria-label="Film camera emoji">🎬</div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">No Scenes Generated</h3>
          <p className="text-dark-300 text-sm sm:text-base">Generate some scenes to see them in the 3D carousel</p>
        </div>
      </div>
    );
  }

  return (
    <KeyboardNavigation
      className={`relative w-full h-full ${className}`}
      onNavigate={handleNavigate}
      onSelect={handleSelect}
      items={generatedScenes}
      currentIndex={currentSceneIndex}
      setCurrentIndex={setCurrentSceneIndex}
    >
      <div className="relative w-full h-64 sm:h-96 lg:h-[500px]">
        <ThreeCarousel 
          scenes={generatedScenes}
          className="w-full h-full"
          config={carouselConfig}
          onSceneSelect={handleSceneSelect}
        />
        
        {/* Navigation Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center space-x-2 bg-dark-800 bg-opacity-80 rounded-lg p-2">
            <button
              onClick={() => handleNavigate('prev')}
              className="p-2 text-dark-300 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800 rounded transition-colors"
              aria-label="Previous scene"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex space-x-1">
              {generatedScenes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSceneIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSceneIndex 
                      ? 'bg-primary-500' 
                      : 'bg-dark-400 hover:bg-dark-300'
                  }`}
                  aria-label={`Go to scene ${index + 1}`}
                  aria-current={index === currentSceneIndex ? 'true' : 'false'}
                />
              ))}
            </div>
            
            <button
              onClick={() => handleNavigate('next')}
              className="p-2 text-dark-300 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800 rounded transition-colors"
              aria-label="Next scene"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scene Information */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-dark-800 bg-opacity-90 rounded-lg p-3 max-w-xs">
            <p className="text-sm text-white font-medium">
              Scene {currentSceneIndex + 1} of {generatedScenes.length}
            </p>
            {generatedScenes[currentSceneIndex]?.prompt && (
              <p className="text-xs text-dark-300 mt-1 line-clamp-2">
                {generatedScenes[currentSceneIndex].prompt}
              </p>
            )}
          </div>
        </div>

        {/* Export Button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => console.log('Export functionality coming in Step 14')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800"
            aria-label="Export all scenes"
          >
            Export Scenes
          </button>
        </div>

        {/* Keyboard Navigation Instructions */}
        <div className="absolute bottom-4 right-4 z-20 hidden lg:block">
          <div className="bg-dark-800 bg-opacity-80 rounded-lg p-2 text-xs text-dark-300">
            <p>Use arrow keys to navigate</p>
            <p>Press Enter or Space to select</p>
          </div>
        </div>
      </div>
    </KeyboardNavigation>
  );
};

export default SceneCarousel;
