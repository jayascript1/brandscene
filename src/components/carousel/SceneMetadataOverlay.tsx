import React from 'react';
import { GeneratedScene } from '../../types';

interface SceneMetadataOverlayProps {
  scene: GeneratedScene;
  index: number;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export const SceneMetadataOverlay: React.FC<SceneMetadataOverlayProps> = ({
  scene,
  index,
  isVisible,
  position,
  onClose
}) => {
  if (!isVisible) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const truncatePrompt = (prompt: string, maxLength: number = 100) => {
    if (prompt.length <= maxLength) return prompt;
    return prompt.substring(0, maxLength) + '...';
  };

  return (
    <div
      className="fixed z-50 bg-black bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm"
      style={{
        left: position.x + 20,
        top: position.y - 20,
        transform: 'translateY(-50%)'
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Close metadata"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Scene header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
            {index + 1}
          </div>
          <h3 className="font-semibold text-lg">Scene {index + 1}</h3>
        </div>
        <div className="text-xs text-gray-400">
          {formatDate(scene.createdAt)}
        </div>
      </div>

      {/* Scene prompt */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-300 mb-1">Prompt</h4>
        <p className="text-sm leading-relaxed">
          {truncatePrompt(scene.prompt)}
        </p>
      </div>

      {/* Scene status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            scene.status === 'completed' ? 'bg-green-500' :
            scene.status === 'generating' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <span className="text-xs capitalize text-gray-300">
            {scene.status}
          </span>
        </div>
        
        {scene.downloadedAt && (
          <div className="text-xs text-gray-400">
            Downloaded {formatDate(scene.downloadedAt)}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-700">
        <button
          onClick={() => {
            // Download functionality will be implemented in Step 14
            console.log('Download scene:', scene.id);
          }}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded transition-colors"
        >
          Download
        </button>
        <button
          onClick={() => {
            // Share functionality could be added later
            console.log('Share scene:', scene.id);
          }}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs py-2 px-3 rounded transition-colors"
        >
          Share
        </button>
      </div>
    </div>
  );
};
