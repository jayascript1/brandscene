import React from 'react';

interface AnimatedLoaderProps {
  type: 'spinner' | 'dots' | 'pulse' | 'wave' | 'scene-generation';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
  text?: string;
}

export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  type,
  size = 'md',
  color = 'primary',
  className = '',
  text
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-8 h-8';
      case 'lg': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary': return 'border-blue-500 text-blue-500';
      case 'white': return 'border-white text-white';
      case 'gray': return 'border-gray-500 text-gray-500';
      default: return 'border-blue-500 text-blue-500';
    }
  };

  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className={`animate-spin rounded-full border-2 border-t-transparent ${getSizeClasses()} ${getColorClasses()}`} />
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full bg-current animate-pulse ${getColorClasses()}`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`${getSizeClasses()} rounded-full bg-current animate-pulse ${getColorClasses()}`} />
        );
      
      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 h-6 bg-current animate-pulse"
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );
      
      case 'scene-generation':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {/* Outer ring */}
              <div className={`${getSizeClasses()} rounded-full border-2 border-t-transparent animate-spin ${getColorClasses()}`} />
              {/* Inner ring */}
              <div className={`absolute inset-2 rounded-full border-2 border-t-transparent animate-spin-reverse ${getColorClasses()}`} />
            </div>
            {text && (
              <div className="text-center">
                <p className="text-sm text-gray-300 animate-pulse">{text}</p>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className={`animate-spin rounded-full border-2 border-t-transparent ${getSizeClasses()} ${getColorClasses()}`} />
        );
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {renderLoader()}
    </div>
  );
};
