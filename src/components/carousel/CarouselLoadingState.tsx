import React from 'react';
import { SkeletonLoader, AnimatedLoader, ProgressIndicator } from '../ui';

interface CarouselLoadingStateProps {
  type: 'initial' | 'generating' | 'loading-scenes';
  progress?: number;
  currentStep?: number;
  totalSteps?: number;
  className?: string;
}

export const CarouselLoadingState: React.FC<CarouselLoadingStateProps> = ({
  type,
  progress = 0,
  currentStep = 0,
  totalSteps = 4,
  className = ''
}) => {
  const renderContent = () => {
    switch (type) {
      case 'initial':
        return (
          <div className="flex flex-col items-center justify-center space-y-6">
            <AnimatedLoader 
              type="scene-generation" 
              size="lg" 
              color="primary"
              text="Initializing 3D Carousel"
            />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Setting up your 3D experience</h3>
              <p className="text-gray-400">Preparing the interactive carousel...</p>
            </div>
          </div>
        );
      
      case 'generating':
        return (
          <div className="flex flex-col items-center justify-center space-y-8">
            <AnimatedLoader 
              type="scene-generation" 
              size="lg" 
              color="primary"
              text="Generating your scenes"
            />
            
            <div className="w-full max-w-md">
              <ProgressIndicator
                progress={progress}
                totalSteps={totalSteps}
                currentStep={currentStep}
                stepLabels={[
                  'Analyzing brand elements',
                  'Creating scene concepts',
                  'Generating 3D scenes',
                  'Finalizing results'
                ]}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Creating your brand scenes</h3>
              <p className="text-gray-400">This may take a few moments...</p>
            </div>
          </div>
        );
      
      case 'loading-scenes':
        return (
          <div className="flex flex-col items-center justify-center space-y-6">
            <AnimatedLoader 
              type="dots" 
              size="lg" 
              color="primary"
            />
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Loading your scenes</h3>
              <p className="text-gray-400">Preparing the 3D carousel...</p>
            </div>
            
            {/* Skeleton scene grid */}
            <div className="w-full max-w-4xl">
              <SkeletonLoader 
                type="scene-grid" 
                count={4}
                className="opacity-50"
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center">
            <AnimatedLoader type="spinner" size="md" color="primary" />
          </div>
        );
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-96 bg-gray-900 rounded-lg ${className}`}>
      <div className="w-full max-w-2xl">
        {renderContent()}
      </div>
    </div>
  );
};
