import React from 'react';
import { ThreeCarousel } from './ThreeCarousel';
import { GeneratedScene } from '../../types';

export const CarouselTest: React.FC = () => {
  // Sample generated scenes for testing
  const sampleScenes: GeneratedScene[] = [
    {
      id: '1',
      sceneNumber: 1,
      imageUrl: 'https://picsum.photos/800/600?random=1',
      prompt: 'A modern office space with brand elements',
      status: 'completed',
      createdAt: new Date()
    },
    {
      id: '2',
      sceneNumber: 2,
      imageUrl: 'https://picsum.photos/800/600?random=2',
      prompt: 'A retail environment showcasing the product',
      status: 'completed',
      createdAt: new Date()
    },
    {
      id: '3',
      sceneNumber: 3,
      imageUrl: 'https://picsum.photos/800/600?random=3',
      prompt: 'An outdoor lifestyle scene',
      status: 'completed',
      createdAt: new Date()
    },
    {
      id: '4',
      sceneNumber: 4,
      imageUrl: 'https://picsum.photos/800/600?random=4',
      prompt: 'A luxury home interior setting',
      status: 'completed',
      createdAt: new Date()
    }
  ];

  const handleSceneSelect = (scene: GeneratedScene, index: number) => {
    console.log(`Selected scene ${index + 1}:`, scene);
  };

  return (
    <div className="w-full h-screen bg-gray-900">
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Three.js Carousel Test</h2>
        <p className="text-gray-300 mb-4">
          This demonstrates the 3D carousel mechanics with 4 sample scenes.
          <br />
          Use arrow keys, click navigation buttons, or swipe on mobile to navigate.
        </p>
      </div>
      <div className="flex-1 h-full">
        <ThreeCarousel 
          scenes={sampleScenes}
          className="w-full h-full"
          config={{
            radius: 8,
            height: 0,
            rotationSpeed: 0.02,
            autoRotate: false
          }}
          onSceneSelect={handleSceneSelect}
        />
      </div>
    </div>
  );
};
