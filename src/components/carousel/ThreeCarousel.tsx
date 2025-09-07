import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';
import { useThreeScene } from '../../hooks/useThreeScene';
import { useThreeObjects } from '../../hooks/useThreeObjects';
import { useCarouselMechanics } from '../../hooks/useCarouselMechanics';
import { GeneratedScene } from '../../types';

import { SceneMetadataOverlay } from './SceneMetadataOverlay';
import { CarouselLoadingState } from './CarouselLoadingState';
import { ExportControls } from './ExportControls';

interface ThreeCarouselProps {
  scenes: GeneratedScene[];
  className?: string;
  config?: {
    radius?: number;
    height?: number;
    rotationSpeed?: number;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
  };
  onSceneSelect?: (scene: GeneratedScene, index: number) => void;
}

export const ThreeCarousel: React.FC<ThreeCarouselProps> = ({
  scenes,
  className = '',
  config = {},
  onSceneSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselGroupRef = useRef<THREE.Group>();
  const sceneObjectsRef = useRef<THREE.Group[]>([]);
  

  const [metadataOverlay, setMetadataOverlay] = useState<{
    isVisible: boolean;
    scene: GeneratedScene | null;
    index: number;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    scene: null,
    index: 0,
    position: { x: 0, y: 0 }
  });

  const [selectedScene, setSelectedScene] = useState<GeneratedScene | null>(null);
  
  const { scene, camera, renderer, isInitialized } = useThreeScene({
    containerRef,
    autoResize: true
  });

  const { createSceneCard } = useThreeObjects();
  
  const {
    state: carouselState,
    getScenePositions,
    rotateToScene,
    nextScene,
    prevScene,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useCarouselMechanics(config);

  // Create scene objects
  const createSceneObjects = useCallback(async () => {
    if (!scene || scenes.length === 0) return;

    // Clear existing objects
    sceneObjectsRef.current.forEach(obj => {
      scene.remove(obj);
    });
    sceneObjectsRef.current = [];

    // Create carousel group
    const carouselGroup = new THREE.Group();
    carouselGroup.name = 'carousel';
    scene.add(carouselGroup);
    carouselGroupRef.current = carouselGroup;

    // Get positions for all scenes
    const positions = getScenePositions(scenes.length);

    // Create enhanced scene cards
    for (let i = 0; i < scenes.length; i++) {
      const sceneData = scenes[i];
      const position = positions[i];
      
      try {
        const sceneCard = await createSceneCard(
          3, // width
          2, // height
          0.1, // depth
          sceneData.imageUrl,
          {
            transparent: true,
            opacity: 0.9,
            castShadow: true,
            receiveShadow: true
          }
        );

        // Position the card
        sceneCard.position.copy(position.position);
        sceneCard.rotation.copy(position.rotation);
        sceneCard.scale.copy(position.scale);

        // Add enhanced metadata
        sceneCard.userData = { 
          sceneIndex: i,
          sceneData: sceneData,
          isEnhanced: true
        };

        carouselGroup.add(sceneCard);
        sceneObjectsRef.current.push(sceneCard);
      } catch (error) {
        console.error(`Failed to create scene card for scene ${i}:`, error);
      }
    }
  }, [scene, scenes, getScenePositions, createSceneCard]);

  // Update carousel rotation
  const updateCarouselRotation = useCallback(() => {
    if (!carouselGroupRef.current) return;
    
    carouselGroupRef.current.rotation.y = carouselState.rotationAngle;
  }, [carouselState.rotationAngle]);

  // Handle scene click
  const handleSceneClick = useCallback((event: MouseEvent) => {
    if (!renderer || !camera) return;

    // Raycasting for object selection
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(sceneObjectsRef.current, true);
    
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      let sceneGroup = clickedObject;
      
      // Find the parent group that contains scene data
      while (sceneGroup && !sceneGroup.userData.sceneIndex) {
        sceneGroup = sceneGroup.parent as THREE.Group;
      }
      
      if (sceneGroup && sceneGroup.userData.sceneIndex !== undefined) {
        const { sceneIndex, sceneData } = sceneGroup.userData;
        
        // Set selected scene
        setSelectedScene(sceneData);
        
        // Show metadata overlay
        setMetadataOverlay({
          isVisible: true,
          scene: sceneData,
          index: sceneIndex,
          position: { x: event.clientX, y: event.clientY }
        });
        
        // Rotate to scene
        rotateToScene(sceneIndex, scenes.length);
        
        if (onSceneSelect) {
          onSceneSelect(sceneData, sceneIndex);
        }
      }
    }
  }, [renderer, camera, rotateToScene, scenes.length, onSceneSelect]);

  // Initialize scene objects when scene is ready
  useEffect(() => {
    if (isInitialized && scene) {
      createSceneObjects();
    }
  }, [isInitialized, scene, createSceneObjects]);

  // Update rotation when carousel state changes
  useEffect(() => {
    updateCarouselRotation();
  }, [updateCarouselRotation]);

  // Add event listeners
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Mouse events
    container.addEventListener('click', handleSceneClick);

    // Touch events
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', (e) => handleTouchMove(e), { passive: false });
    container.addEventListener('touchend', () => handleTouchEnd(scenes.length));

    return () => {
      container.removeEventListener('click', handleSceneClick);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', (e) => handleTouchMove(e));
      container.removeEventListener('touchend', () => handleTouchEnd(scenes.length));
    };
  }, [handleSceneClick, handleTouchStart, handleTouchMove, handleTouchEnd, scenes.length]);

  // Navigation controls
  const handleNext = useCallback(() => {
    nextScene(scenes.length);
  }, [nextScene, scenes.length]);

  const handlePrev = useCallback(() => {
    prevScene(scenes.length);
  }, [prevScene, scenes.length]);

  // Handle metadata overlay close
  const handleMetadataClose = useCallback(() => {
    setMetadataOverlay(prev => ({ ...prev, isVisible: false }));
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div 
        ref={containerRef}
        className="w-full h-full"
        style={{ position: 'relative' }}
      />
      
      {/* Navigation Controls */}
      {scenes.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-3 transition-all duration-200 z-10"
            aria-label="Previous scene"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-3 transition-all duration-200 z-10"
            aria-label="Next scene"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      
      {/* Scene Indicator */}
      {scenes.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {scenes.map((_, index) => (
            <button
              key={index}
              onClick={() => rotateToScene(index, scenes.length)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === carouselState.currentIndex
                  ? 'bg-white'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to scene ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Loading State */}
      {!isInitialized && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 z-20">
          <CarouselLoadingState 
            type="initial"
            className="h-full"
          />
        </div>
      )}

      {/* Export Controls */}
      <div className="absolute top-4 right-4 z-20 w-80">
        <ExportControls 
          scenes={scenes}
          selectedScene={selectedScene}
        />
      </div>

      {/* Metadata Overlay */}
      {metadataOverlay.isVisible && metadataOverlay.scene && (
        <SceneMetadataOverlay
          scene={metadataOverlay.scene}
          index={metadataOverlay.index}
          isVisible={metadataOverlay.isVisible}
          position={metadataOverlay.position}
          onClose={handleMetadataClose}
        />
      )}
    </div>
  );
};
