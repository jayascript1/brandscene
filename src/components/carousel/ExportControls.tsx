import React, { useState } from 'react';
import { GeneratedScene } from '../../types';
import { useExport } from '../../hooks/useExport';
import { ExportOptions } from '../../utils/exportUtils';
import { AnimatedLoader, ProgressIndicator } from '../ui';

interface ExportControlsProps {
  scenes: GeneratedScene[];
  selectedScene?: GeneratedScene | null;
  className?: string;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  scenes,
  selectedScene,
  className = ''
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 0.9,
    includeMetadata: true
  });

  const {
    isExporting,
    currentOperation,
    progress,
    currentScene,
    error,
    completedDownloads,
    exportSingleScene,
    exportMultipleScenes,
    exportAsZip,
    clearExportState,

    isSceneCompleted
  } = useExport();

  const handleExportSingle = async () => {
    if (selectedScene) {
      await exportSingleScene(selectedScene, exportOptions);
    }
  };

  const handleExportAll = async () => {
    await exportMultipleScenes(scenes, exportOptions);
  };

  const handleExportZip = async () => {
    await exportAsZip(scenes, exportOptions);
  };

  const getOperationText = () => {
    switch (currentOperation) {
      case 'single':
        return 'Downloading scene...';
      case 'multiple':
        return 'Downloading all scenes...';
      case 'zip':
        return 'Creating ZIP file...';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Export Scenes</h3>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Export Options */}
      {showOptions && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Format
              </label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm"
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quality
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={exportOptions.quality}
                onChange={(e) => setExportOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{Math.round((exportOptions.quality || 0.9) * 100)}%</span>
            </div>
          </div>
          <div className="mt-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeMetadata}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">Include metadata overlay</span>
            </label>
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div className="space-y-2">
        {selectedScene && (
          <button
            onClick={handleExportSingle}
            disabled={isExporting}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              isExporting && currentScene === selectedScene.id
                ? 'bg-blue-600 text-white cursor-not-allowed'
                : isSceneCompleted(selectedScene.id)
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isExporting && currentScene === selectedScene.id ? (
              <>
                <AnimatedLoader type="dots" size="sm" color="white" />
                <span className="ml-2">Downloading...</span>
              </>
            ) : isSceneCompleted(selectedScene.id) ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Download Scene {selectedScene.sceneNumber}
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Scene {selectedScene.sceneNumber}
              </>
            )}
          </button>
        )}

        <button
          onClick={handleExportAll}
          disabled={isExporting}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
            isExporting && currentOperation === 'multiple'
              ? 'bg-purple-600 text-white cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isExporting && currentOperation === 'multiple' ? (
            <>
              <AnimatedLoader type="dots" size="sm" color="white" />
              <span className="ml-2">Downloading all scenes...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download All Scenes ({scenes.length})
            </>
          )}
        </button>

        <button
          onClick={handleExportZip}
          disabled={isExporting}
          className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
            isExporting && currentOperation === 'zip'
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isExporting && currentOperation === 'zip' ? (
            <>
              <AnimatedLoader type="dots" size="sm" color="white" />
              <span className="ml-2">Creating ZIP...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Download as ZIP
            </>
          )}
        </button>
      </div>

      {/* Progress Indicator */}
      {isExporting && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">{getOperationText()}</span>
            <span className="text-sm text-gray-300">{Math.round(progress)}%</span>
          </div>
          <ProgressIndicator
            progress={progress}
            totalSteps={4}
            currentStep={Math.floor(progress / 25)}
            showStepLabels={false}
            showPercentage={false}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-300">{error}</span>
          </div>
          <button
            onClick={clearExportState}
            className="mt-2 text-xs text-red-400 hover:text-red-300"
          >
            Clear error
          </button>
        </div>
      )}

      {/* Completed Downloads */}
      {completedDownloads.length > 0 && (
        <div className="mt-4 p-3 bg-green-900 border border-green-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-300">
              {completedDownloads.length} scene{completedDownloads.length !== 1 ? 's' : ''} downloaded
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
