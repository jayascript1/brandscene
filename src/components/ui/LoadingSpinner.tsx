import React from 'react';
import ProgressBar from './ProgressBar';

interface LoadingSpinnerProps {
  message?: string;
  progress?: number;
  className?: string;
  variant?: 'default' | 'pulse' | 'wave';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  progress,
  className = '',
  variant = 'default'
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case 'pulse':
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full animate-pulse-slow"></div>
            <div className="absolute inset-0 w-16 h-16 bg-primary-500 rounded-full animate-ping"></div>
          </div>
        );
      
      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 h-8 bg-primary-500 rounded-full animate-pulse"
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );
      
      default:
        return (
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500/20 border-t-primary-500"></div>
            {progress !== undefined && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-500">
                  {Math.round(progress)}%
                </span>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="animate-bounce-in">
        {renderSpinner()}
      </div>
      
      <p className="text-dark-300 mt-4 text-center animate-fade-in">{message}</p>
      
      {progress !== undefined && (
        <div className="w-full max-w-xs mt-4">
          <ProgressBar 
            progress={progress} 
            variant="gradient"
            showPercentage={false}
          />
        </div>
      )}
      
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 w-2 h-2 bg-primary-500/30 rounded-full animate-pulse"></div>
        <div className="absolute top-8 right-6 w-1 h-1 bg-primary-500/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-6 left-8 w-1 h-1 bg-primary-500/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
