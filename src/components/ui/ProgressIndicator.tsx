import React from 'react';

interface ProgressIndicatorProps {
  progress: number;
  totalSteps: number;
  currentStep: number;
  stepLabels?: string[];
  className?: string;
  showPercentage?: boolean;
  showStepLabels?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  totalSteps,
  currentStep,
  stepLabels = [],
  className = '',
  showPercentage = true,
  showStepLabels = true
}) => {
  const defaultStepLabels = [
    'Analyzing brand',
    'Generating concepts',
    'Creating scenes',
    'Finalizing results'
  ];

  const labels = stepLabels.length > 0 ? stepLabels : defaultStepLabels;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Progress Percentage */}
        {showPercentage && (
          <div className="absolute top-4 right-0 text-sm text-gray-300 font-medium">
            {Math.round(progress)}%
          </div>
        )}
      </div>

      {/* Step Indicators */}
      <div className="mt-4 flex justify-between">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              index < currentStep
                ? 'bg-green-500 text-white'
                : index === currentStep
                ? 'bg-blue-500 text-white animate-pulse'
                : 'bg-gray-600 text-gray-400'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            
            {showStepLabels && labels[index] && (
              <div className="mt-2 text-xs text-center max-w-20">
                <span className={`transition-colors duration-300 ${
                  index <= currentStep ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {labels[index]}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current Step Description */}
      {showStepLabels && labels[currentStep] && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-300">
            Currently: <span className="text-blue-400 font-medium">{labels[currentStep]}</span>
          </p>
        </div>
      )}
    </div>
  );
};
