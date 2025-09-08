import { useState, useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';

interface CarouselConfig {
  radius: number;
  height: number;
  rotationSpeed: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
}

interface CarouselState {
  currentIndex: number;
  rotationAngle: number;
  isRotating: boolean;
  targetRotation: number;
}

interface ScenePosition {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

export const useCarouselMechanics = (config: Partial<CarouselConfig> = {}) => {
  const {
    radius = 8,
    height = 0,
    rotationSpeed = 0.02,
    autoRotate = false,
    autoRotateSpeed = 0.005
  } = config;

  const [state, setState] = useState<CarouselState>({
    currentIndex: 0,
    rotationAngle: 0,
    isRotating: false,
    targetRotation: 0
  });

  const animationRef = useRef<number>();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartAngleRef = useRef<number>(0);

  // Calculate position for a scene at a given index
  const getScenePosition = useCallback((index: number, totalScenes: number): ScenePosition => {
    const angleStep = (2 * Math.PI) / totalScenes;
    const angle = index * angleStep;
    
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    
    return {
      position: new THREE.Vector3(x, height, z),
      rotation: new THREE.Euler(0, angle + Math.PI, 0), // Face center
      scale: new THREE.Vector3(1, 1, 1)
    };
  }, [radius, height]);

  // Calculate positions for all scenes
  const getScenePositions = useCallback((totalScenes: number): ScenePosition[] => {
    return Array.from({ length: totalScenes }, (_, index) => 
      getScenePosition(index, totalScenes)
    );
  }, [getScenePosition]);

  // Rotate to specific scene
  const rotateToScene = useCallback((targetIndex: number, totalScenes: number, animate: boolean = true) => {
    const angleStep = (2 * Math.PI) / totalScenes;
    const targetAngle = targetIndex * angleStep;
    
    setState(prev => ({
      ...prev,
      currentIndex: targetIndex,
      isRotating: animate,
      targetRotation: -targetAngle
    }));
  }, []);

  // Next scene
  const nextScene = useCallback((totalScenes: number) => {
    const nextIndex = (state.currentIndex + 1) % totalScenes;
    rotateToScene(nextIndex, totalScenes);
  }, [state.currentIndex, rotateToScene]);

  // Previous scene
  const prevScene = useCallback((totalScenes: number) => {
    const prevIndex = (state.currentIndex - 1 + totalScenes) % totalScenes;
    rotateToScene(prevIndex, totalScenes);
  }, [state.currentIndex, rotateToScene]);

  // Handle touch start
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 1) {
      touchStartRef.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
      touchStartAngleRef.current = state.rotationAngle;
    }
  }, [state.rotationAngle]);

  // Handle touch move
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!touchStartRef.current || event.touches.length !== 1) return;

    event.preventDefault();
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // Only respond to horizontal swipes (improved threshold)
    if (Math.abs(deltaX) < Math.abs(deltaY) * 0.5) return;
    
    // Enhanced sensitivity with momentum
    const sensitivity = 0.008;
    const momentum = Math.min(Math.abs(deltaX) / 100, 2); // Add momentum based on swipe speed
    const newAngle = touchStartAngleRef.current + deltaX * sensitivity * momentum;
    
    setState(prev => ({
      ...prev,
      rotationAngle: newAngle,
      isRotating: true
    }));
  }, []);

  // Handle touch end
  const handleTouchEnd = useCallback((totalScenes: number) => {
    if (!touchStartRef.current) return;

    // Enhanced snap logic with velocity consideration
    const angleStep = (2 * Math.PI) / totalScenes;
    const currentAngle = state.rotationAngle;
    
    // Calculate velocity for momentum-based snapping
    const deltaAngle = currentAngle - touchStartAngleRef.current;
    const velocity = Math.abs(deltaAngle);
    
    let nearestIndex = Math.round(-currentAngle / angleStep) % totalScenes;
    
    // Add momentum-based adjustment for fast swipes
    if (velocity > 0.1) {
      const direction = Math.sign(deltaAngle);
      nearestIndex = (nearestIndex + direction) % totalScenes;
    }
    
    const normalizedIndex = (nearestIndex + totalScenes) % totalScenes;
    
    rotateToScene(normalizedIndex, totalScenes);
    touchStartRef.current = null;
  }, [state.rotationAngle, rotateToScene]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent, totalScenes: number) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        prevScene(totalScenes);
        break;
      case 'ArrowRight':
        event.preventDefault();
        nextScene(totalScenes);
        break;
      case 'Home':
        event.preventDefault();
        rotateToScene(0, totalScenes);
        break;
      case 'End':
        event.preventDefault();
        rotateToScene(totalScenes - 1, totalScenes);
        break;
    }
  }, [prevScene, nextScene, rotateToScene]);

  // Animation loop with easing
  const animate = useCallback(() => {
    setState(prev => {
      if (prev.isRotating) {
        const diff = prev.targetRotation - prev.rotationAngle;
        
        // Enhanced easing for smoother transitions
        const easingFactor = 0.1; // Adjust for smoother/easier transitions
        const step = diff * easingFactor;
        
        if (Math.abs(diff) < 0.001) {
          return {
            ...prev,
            rotationAngle: prev.targetRotation,
            isRotating: false
          };
        }
        
        return {
          ...prev,
          rotationAngle: prev.rotationAngle + step
        };
      } else if (autoRotate) {
        return {
          ...prev,
          rotationAngle: prev.rotationAngle + autoRotateSpeed
        };
      }
      
      return prev;
    });
    
    animationRef.current = requestAnimationFrame(animate);
  }, [autoRotate, autoRotateSpeed]);

  // Start animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Add keyboard event listeners
  useEffect(() => {
    const handleKeyDownWrapper = (event: KeyboardEvent) => {
      // We'll need to pass totalScenes from the component
      // For now, we'll use a default of 4
      handleKeyDown(event, 4);
    };

    window.addEventListener('keydown', handleKeyDownWrapper);
    return () => window.removeEventListener('keydown', handleKeyDownWrapper);
  }, [handleKeyDown]);

  return {
    state,
    getScenePosition,
    getScenePositions,
    rotateToScene,
    nextScene,
    prevScene,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeyDown
  };
};
