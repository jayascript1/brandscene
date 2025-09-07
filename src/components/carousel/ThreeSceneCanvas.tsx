import React, { useRef, useEffect } from 'react';
import { useThreeScene } from '../../hooks/useThreeScene';

interface ThreeSceneCanvasProps {
  className?: string;
  autoResize?: boolean;
  enableControls?: boolean;
  onSceneReady?: (scene: any, camera: any, renderer: any) => void;
}

export const ThreeSceneCanvas: React.FC<ThreeSceneCanvasProps> = ({
  className = '',
  autoResize = true,
  enableControls = false,
  onSceneReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scene, camera, renderer, isInitialized } = useThreeScene({
    containerRef,
    autoResize,
    enableControls
  });

  // Notify parent component when scene is ready
  useEffect(() => {
    if (isInitialized && scene && camera && renderer && onSceneReady) {
      onSceneReady(scene, camera, renderer);
    }
  }, [isInitialized, scene, camera, renderer, onSceneReady]);

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ 
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Initializing 3D Scene...</p>
          </div>
        </div>
      )}
    </div>
  );
};
