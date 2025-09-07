import React from 'react';

interface SkeletonLoaderProps {
  type: 'scene-card' | 'scene-grid' | 'text' | 'button' | 'circle';
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  className = '',
  count = 1
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'scene-card':
        return (
          <div className={`bg-gray-700 rounded-lg overflow-hidden animate-pulse ${className}`}>
            <div className="aspect-[4/3] bg-gray-600"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
              <div className="h-3 bg-gray-600 rounded w-1/2"></div>
              <div className="h-3 bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        );
      
      case 'scene-grid':
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="bg-gray-700 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-600"></div>
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="h-4 bg-gray-600 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
            ))}
          </div>
        );
      
      case 'button':
        return (
          <div className={`h-10 bg-gray-600 rounded-lg animate-pulse ${className}`}></div>
        );
      
      case 'circle':
        return (
          <div className={`w-8 h-8 bg-gray-600 rounded-full animate-pulse ${className}`}></div>
        );
      
      default:
        return null;
    }
  };

  return renderSkeleton();
};
