import React from 'react';

interface CarouselControlsProps {
  currentIndex: number;
  totalScenes: number;
  onNext: () => void;
  onPrev: () => void;
  onGoToScene: (index: number) => void;
  isAnimating: boolean;
}

const CarouselControls: React.FC<CarouselControlsProps> = ({
  currentIndex,
  totalScenes,
  onNext,
  onPrev,
  onGoToScene,
  isAnimating
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Previous button */}
      <button
        onClick={onPrev}
        disabled={isAnimating}
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-auto ${
          isAnimating 
            ? 'opacity-50 cursor-not-allowed' 
            : 'opacity-80 hover:opacity-100'
        } transition-opacity duration-200`}
      >
        <div className="w-12 h-12 bg-dark-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-dark-600 hover:border-primary-500 transition-colors">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </button>

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={isAnimating}
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-auto ${
          isAnimating 
            ? 'opacity-50 cursor-not-allowed' 
            : 'opacity-80 hover:opacity-100'
        } transition-opacity duration-200`}
      >
        <div className="w-12 h-12 bg-dark-800/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-dark-600 hover:border-primary-500 transition-colors">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Scene indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="flex space-x-2">
          {Array.from({ length: totalScenes }, (_, index) => (
            <button
              key={index}
              onClick={() => onGoToScene(index)}
              disabled={isAnimating}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-primary-500 scale-125' 
                  : 'bg-dark-600 hover:bg-dark-500'
              } ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            />
          ))}
        </div>
      </div>

      {/* Scene counter */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-dark-600">
          <span className="text-sm text-white">
            {currentIndex + 1} / {totalScenes}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-lg px-3 py-1 border border-dark-600">
          <span className="text-xs text-dark-300">
            Drag to rotate • Click to navigate
          </span>
        </div>
      </div>
    </div>
  );
};

export default CarouselControls;
