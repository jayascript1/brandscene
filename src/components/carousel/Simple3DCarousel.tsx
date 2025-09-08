import React, { useState, useCallback, useEffect } from 'react';
import { GeneratedScene } from '../../types';
import { ASPECT_RATIO_CLASSES } from '../../services/replicate';

interface Simple3DCarouselProps {
  scenes: GeneratedScene[];
  className?: string;
  imageDimensions?: 'square' | 'portrait' | 'landscape';
  onSceneSelect?: (scene: GeneratedScene, index: number) => void;
}

export const Simple3DCarousel: React.FC<Simple3DCarouselProps> = ({
  scenes,
  className = '',
  imageDimensions = 'square',
  onSceneSelect
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerDimensions, setContainerDimensions] = useState({ width: 400, height: 400 });
  const aspectRatioClass = ASPECT_RATIO_CLASSES[imageDimensions];

  // Update dimensions on mount and resize
  useEffect(() => {
    const getContainerDimensions = () => {
      // Responsive base dimensions
      const isMobile = window.innerWidth < 640;
      const isTablet = window.innerWidth < 1024;
      
      let baseHeight, baseWidth;
      if (isMobile) {
        baseHeight = 300;
        baseWidth = 300;
      } else if (isTablet) {
        baseHeight = 350;
        baseWidth = 350;
      } else {
        baseHeight = 400;
        baseWidth = 400;
      }
      
      switch (imageDimensions) {
        case 'square':
          return { width: baseWidth, height: baseHeight };
        case 'portrait':
          return { width: baseWidth * 0.75, height: baseHeight * 1.33 }; // 9:16 ratio
        case 'landscape':
          return { width: baseWidth * 1.33, height: baseHeight * 0.75 }; // 16:9 ratio
        default:
          return { width: baseWidth, height: baseHeight };
      }
    };

    const updateDimensions = () => {
      setContainerDimensions(getContainerDimensions());
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [imageDimensions]);

  const nextScene = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % scenes.length);
  }, [scenes.length]);

  const prevScene = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? scenes.length - 1 : prev - 1));
  }, [scenes.length]);

  const goToScene = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  if (scenes.length === 0) {
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
    <div className={`relative mx-auto ${className}`} style={{ 
      width: `${containerDimensions.width}px`, 
      height: `${containerDimensions.height}px`,
      maxWidth: '100%'
    }}>
      {/* 3D Carousel Container */}
      <div className="relative w-full h-full perspective-1000">
        <div className="relative w-full h-full transform-style-preserve-3d">
          {scenes.map((scene, index) => {
            const isActive = index === currentIndex;
            const isPrev = index === (currentIndex - 1 + scenes.length) % scenes.length;
            const isNext = index === (currentIndex + 1) % scenes.length;
            
            let transform = '';
            let opacity = 0.3;
            let zIndex = 1;
            
            if (isActive) {
              transform = 'translateZ(0px) scale(1)';
              opacity = 1;
              zIndex = 3;
            } else if (isPrev) {
              transform = 'translateZ(-100px) translateX(-200px) rotateY(45deg) scale(0.8)';
              opacity = 0.6;
              zIndex = 2;
            } else if (isNext) {
              transform = 'translateZ(-100px) translateX(200px) rotateY(-45deg) scale(0.8)';
              opacity = 0.6;
              zIndex = 2;
            } else {
              transform = 'translateZ(-200px) scale(0.6)';
              opacity = 0.2;
              zIndex = 1;
            }

            return (
              <div
                key={scene.id}
                className="absolute inset-0 transition-all duration-500 ease-out cursor-pointer"
                style={{
                  transform,
                  opacity,
                  zIndex
                }}
                onClick={() => {
                  goToScene(index);
                  onSceneSelect?.(scene, index);
                }}
              >
                <div className={`${aspectRatioClass} bg-dark-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow`}>
                  <img
                    src={scene.imageUrl}
                    alt={`Scene ${scene.sceneNumber}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-1 bg-dark-800 bg-opacity-80 rounded-lg p-2">
          {scenes.map((_, index) => (
            <button
              key={index}
              onClick={() => goToScene(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-primary-500' 
                  : 'bg-dark-400 hover:bg-dark-300'
              }`}
              aria-label={`Go to scene ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      </div>

      {/* Touch/Swipe Support */}
      <div
        className="absolute inset-0 z-10"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          const startX = touch.clientX;
          
          const handleTouchEnd = (e: TouchEvent) => {
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
              if (diff > 0) {
                nextScene();
              } else {
                prevScene();
              }
            }
            
            document.removeEventListener('touchend', handleTouchEnd);
          };
          
          document.addEventListener('touchend', handleTouchEnd);
        }}
      />

      {/* Keyboard Support */}
      <div
        className="absolute inset-0 z-10"
        tabIndex={0}
        onKeyDown={(e) => {
          switch (e.key) {
            case 'ArrowLeft':
              e.preventDefault();
              prevScene();
              break;
            case 'ArrowRight':
              e.preventDefault();
              nextScene();
              break;
            case 'Enter':
            case ' ':
              e.preventDefault();
              onSceneSelect?.(scenes[currentIndex], currentIndex);
              break;
          }
        }}
      />
    </div>
  );
};
