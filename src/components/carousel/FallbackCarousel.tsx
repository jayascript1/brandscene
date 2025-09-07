import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import SceneCard from './SceneCard';

interface FallbackCarouselProps {
  className?: string;
}

const FallbackCarousel: React.FC<FallbackCarouselProps> = ({ className = '' }) => {
  const { state } = useAppContext();
  const { generatedScenes } = state;
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextScene = () => {
    setCurrentIndex((prev) => (prev + 1) % generatedScenes.length);
  };

  const prevScene = () => {
    setCurrentIndex((prev) => (prev === 0 ? generatedScenes.length - 1 : prev - 1));
  };

  const goToScene = (index: number) => {
    setCurrentIndex(index);
  };

  if (generatedScenes.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 bg-dark-800 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="text-dark-400 mb-4">
            <svg className="mx-auto h-16 w-16" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40h10v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714m0 0a10 10 0 012.828-2.828M24 32a10 10 0 012.828-2.828" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Scenes Available</h3>
          <p className="text-dark-300">Generate some scenes to see them in 3D</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="bg-dark-800 rounded-lg p-8">
        <div className="relative">
          {/* Previous button */}
          <button
            onClick={prevScene}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-dark-700/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-dark-600 hover:border-primary-500 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button */}
          <button
            onClick={nextScene}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-dark-700/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-dark-600 hover:border-primary-500 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Current scene */}
          <div className="flex justify-center">
            <SceneCard 
              scene={generatedScenes[currentIndex]} 
              className="max-w-md"
            />
          </div>
        </div>

        {/* Scene indicators */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {generatedScenes.map((_, index) => (
              <button
                key={index}
                onClick={() => goToScene(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-primary-500 scale-125' 
                    : 'bg-dark-600 hover:bg-dark-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scene counter */}
        <div className="absolute top-4 right-4">
          <div className="bg-dark-700/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-dark-600">
            <span className="text-sm text-white">
              {currentIndex + 1} / {generatedScenes.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallbackCarousel;
