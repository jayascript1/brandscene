import React, { useState, useEffect } from 'react';
import SceneCarousel from './SceneCarousel';
import FallbackCarousel from './FallbackCarousel';

interface CarouselWrapperProps {
  className?: string;
}

const CarouselWrapper: React.FC<CarouselWrapperProps> = ({ className = '' }) => {
  const [threeJsAvailable, setThreeJsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if Three.js is available
    const checkThreeJs = async () => {
      try {
        // Try to import Three.js
        await import('three');
        
        // Check if WebGL is supported
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
          setThreeJsAvailable(true);
        } else {
          setThreeJsAvailable(false);
        }
      } catch (error) {
        console.warn('Three.js not available, using fallback carousel:', error);
        setThreeJsAvailable(false);
      }
    };

    checkThreeJs();
  }, []);

  // Show loading state while checking
  if (threeJsAvailable === null) {
    return (
      <div className={`flex items-center justify-center h-96 bg-dark-800 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-300">Loading 3D carousel...</p>
        </div>
      </div>
    );
  }

  // Use fallback carousel if Three.js is not available
  if (!threeJsAvailable) {
    return <FallbackCarousel className={className} />;
  }

  // Use 3D carousel if Three.js is available
  return <SceneCarousel className={className} />;
};

export default CarouselWrapper;
