import React, { useState } from 'react';
import { ExportControls } from './ExportControls';
import { GeneratedScene } from '../../types';

export const ExportTest: React.FC = () => {
  const [selectedScene, setSelectedScene] = useState<GeneratedScene | null>(null);

  // Sample generated scenes for testing export functionality
  const sampleScenes: GeneratedScene[] = [
    {
      id: '1',
      sceneNumber: 1,
      imageUrl: 'https://picsum.photos/800/600?random=1',
      prompt: 'A modern minimalist office space with clean lines, natural lighting, and brand elements subtly integrated throughout the environment.',
      status: 'completed',
      createdAt: new Date('2024-01-15T10:30:00Z'),
      downloadedAt: new Date('2024-01-15T11:00:00Z')
    },
    {
      id: '2',
      sceneNumber: 2,
      imageUrl: 'https://picsum.photos/800/600?random=2',
      prompt: 'A vibrant retail environment showcasing the product in an engaging display with premium quality brand experience.',
      status: 'completed',
      createdAt: new Date('2024-01-15T10:35:00Z')
    },
    {
      id: '3',
      sceneNumber: 3,
      imageUrl: 'https://picsum.photos/800/600?random=3',
      prompt: 'An outdoor lifestyle scene featuring the product in a natural setting emphasizing connection between brand and active lifestyle.',
      status: 'completed',
      createdAt: new Date('2024-01-15T10:40:00Z')
    },
    {
      id: '4',
      sceneNumber: 4,
      imageUrl: 'https://picsum.photos/800/600?random=4',
      prompt: 'A luxury home interior setting with sophisticated design elements reflecting premium positioning and aspirational lifestyle.',
      status: 'completed',
      createdAt: new Date('2024-01-15T10:45:00Z')
    }
  ];

  return (
    <div className="w-full h-screen bg-gray-900">
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Export Functionality Test</h2>
        <p className="text-gray-300 mb-4">
          This demonstrates the export functionality with download options, progress tracking, and error handling.
          <br />
          Try downloading individual scenes, all scenes, or as a ZIP file.
        </p>
        
        {/* Scene Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Select a Scene</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sampleScenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setSelectedScene(scene)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  selectedScene?.id === scene.id
                    ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                }`}
              >
                <div className="aspect-[4/3] bg-gray-700 rounded mb-2 overflow-hidden">
                  <img 
                    src={scene.imageUrl} 
                    alt={`Scene ${scene.sceneNumber}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium">Scene {scene.sceneNumber}</p>
                <p className="text-xs text-gray-400 truncate">
                  {scene.prompt.substring(0, 30)}...
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <ExportControls 
            scenes={sampleScenes}
            selectedScene={selectedScene}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
