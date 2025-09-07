import React, { useRef, useEffect, useState } from 'react';
// import * as THREE from 'three';
import { GeneratedScene } from '../../types';

interface SceneCardProps {
  scene: GeneratedScene;
  className?: string;
  onClick?: () => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, className = '', onClick }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!mountRef.current || !scene.imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };
    
    img.src = scene.imageUrl;
  }, [scene.imageUrl]);

  if (isLoading) {
    return (
      <div className={`bg-dark-700 rounded-lg p-4 animate-pulse ${className}`}>
        <div className="aspect-square bg-dark-600 rounded mb-3"></div>
        <div className="h-4 bg-dark-600 rounded mb-2"></div>
        <div className="h-3 bg-dark-600 rounded w-3/4"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`bg-dark-700 rounded-lg p-4 ${className}`}>
        <div className="aspect-square bg-dark-600 rounded mb-3 flex items-center justify-center">
          <div className="text-center">
            <svg className="mx-auto h-8 w-8 text-dark-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M24 4l2.83 2.83L24 9.66l-2.83-2.83L24 4zM12 24l2.83-2.83L9.66 24l2.83 2.83L12 24zm12 0l-2.83 2.83L38.34 24l-2.83-2.83L24 24zM24 38.34l2.83 2.83L24 43.17l-2.83-2.83L24 38.34z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm text-dark-400">Failed to load</p>
          </div>
        </div>
        <h3 className="text-sm font-medium text-white mb-1">Scene {scene.sceneNumber}</h3>
        <p className="text-xs text-dark-300 line-clamp-2">Image unavailable</p>
      </div>
    );
  }

  return (
    <div 
      ref={mountRef}
      className={`bg-dark-700 rounded-lg p-4 cursor-pointer hover:bg-dark-600 transition-colors ${className}`}
      onClick={onClick}
    >
      <div className="aspect-square bg-dark-600 rounded mb-3 overflow-hidden">
        <img 
          src={scene.imageUrl} 
          alt={`Scene ${scene.sceneNumber}`}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-sm font-medium text-white mb-1">Scene {scene.sceneNumber}</h3>
      <p className="text-xs text-dark-300 line-clamp-2">
        {scene.prompt}
      </p>
    </div>
  );
};

export default SceneCard;
