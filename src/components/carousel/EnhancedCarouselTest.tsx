import React, { useState } from 'react';
import { ThreeCarousel } from './ThreeCarousel';
import { GeneratedScene } from '../../types';

export const EnhancedCarouselTest: React.FC = () => {
  const [selectedScene, setSelectedScene] = useState<GeneratedScene | null>(null);

  // Sample generated scenes with more detailed metadata
  const sampleScenes: GeneratedScene[] = [
    {
      id: '1',
      sceneNumber: 1,
      imageUrl: 'https://picsum.photos/800/600?random=1',
      prompt: 'A modern minimalist office space with clean lines, natural lighting, and brand elements subtly integrated throughout the environment. The scene should convey professionalism and innovation.',
      status: 'completed',
      createdAt: new Date('2024-01-15T10:30:00Z'),
      downloadedAt: new Date('2024-01-15T11:00:00Z')
    },
    {
      id: '2',
      sceneNumber: 2,
      imageUrl: 'https://picsum.photos/800/600?random=2',
      prompt: 'A vibrant retail environment showcasing the product in an engaging display. The scene should capture the excitement of discovery and the premium quality of the brand experience.',
      status: 'completed',
      createdAt: new Date('2024-01-15T10:35:00Z')
    },
    {
      id: '3',
      sceneNumber: 3,
      imageUrl: 'https://picsum.photos/800/600?random=3',
      prompt: 'An outdoor lifestyle scene featuring the product in a natural setting. The composition should emphasize the connection between the brand and an active, adventurous lifestyle.',
      status: 'completed',
      createdAt: new Date('2024-01-15T10:40:00Z')
    },
    {
      id: '4',
      sceneNumber: 4,
      imageUrl: 'https://picsum.photos/800/600?random=4',
      prompt: 'A luxury home interior setting with sophisticated design elements. The scene should reflect the premium positioning of the brand and create an aspirational lifestyle moment.',
      status: 'completed',
      createdAt: new Date('2024-01-15T10:45:00Z')
    }
  ];

  const handleSceneSelect = (scene: GeneratedScene, index: number) => {
    setSelectedScene(scene);
    console.log(`Selected scene ${index + 1}:`, scene);
  };

  return (
    <div className="w-full h-screen bg-gray-900">
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Enhanced Scene Card Test</h2>
        <p className="text-gray-300 mb-4">
          This demonstrates the enhanced scene cards with metadata display and interaction states.
          <br />
          Click on any scene to see detailed metadata overlay with prompt, status, and actions.
        </p>
        
        {selectedScene && (
          <div className="mb-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Last Selected Scene</h3>
            <p className="text-sm text-gray-300">
              <strong>Scene {selectedScene.sceneNumber}:</strong> {selectedScene.prompt.substring(0, 100)}...
            </p>
          </div>
        )}
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
