import { useState, useCallback, useEffect } from 'react';
import { GeneratedScene } from '../types';
import { ExportManager, ExportOptions, DownloadProgress } from '../utils/exportUtils';

interface ExportState {
  isExporting: boolean;
  currentOperation: 'single' | 'multiple' | 'zip' | null;
  progress: number;
  currentScene: string | null;
  error: string | null;
  completedDownloads: string[];
}

export const useExport = () => {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    currentOperation: null,
    progress: 0,
    currentScene: null,
    error: null,
    completedDownloads: []
  });

  const [downloadProgress, setDownloadProgress] = useState<Map<string, DownloadProgress>>(new Map());

  const exportManager = ExportManager.getInstance();

  // Update download progress
  const updateProgress = useCallback(() => {
    const progress = exportManager.getAllDownloadProgress();
    const progressMap = new Map(progress.map(p => [p.sceneId, p]));
    setDownloadProgress(progressMap);
  }, [exportManager]);

  // Export single scene
  const exportSingleScene = useCallback(async (
    scene: GeneratedScene, 
    options?: ExportOptions
  ) => {
    setState(prev => ({
      ...prev,
      isExporting: true,
      currentOperation: 'single',
      progress: 0,
      currentScene: scene.id,
      error: null
    }));

    try {
      await exportManager.downloadScene(scene, options);
      const filename = exportManager.generateFilename(scene, options?.format || 'png');
      exportManager.triggerDownload(await exportManager.downloadScene(scene, options), filename);

      setState(prev => ({
        ...prev,
        isExporting: false,
        currentOperation: null,
        progress: 100,
        currentScene: null,
        completedDownloads: [...prev.completedDownloads, scene.id]
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExporting: false,
        currentOperation: null,
        error: error instanceof Error ? error.message : 'Export failed'
      }));
    }
  }, [exportManager]);

  // Export multiple scenes
  const exportMultipleScenes = useCallback(async (
    scenes: GeneratedScene[], 
    options?: ExportOptions
  ) => {
    setState(prev => ({
      ...prev,
      isExporting: true,
      currentOperation: 'multiple',
      progress: 0,
      currentScene: null,
      error: null
    }));

    try {
      const blobs = await exportManager.downloadScenes(scenes, options);
      
      blobs.forEach((blob, index) => {
        const scene = scenes[index];
        const filename = exportManager.generateFilename(scene, options?.format || 'png');
        exportManager.triggerDownload(blob, filename);
      });

      setState(prev => ({
        ...prev,
        isExporting: false,
        currentOperation: null,
        progress: 100,
        completedDownloads: [...prev.completedDownloads, ...scenes.map(s => s.id)]
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExporting: false,
        currentOperation: null,
        error: error instanceof Error ? error.message : 'Export failed'
      }));
    }
  }, [exportManager]);

  // Export as ZIP
  const exportAsZip = useCallback(async (
    scenes: GeneratedScene[], 
    options?: ExportOptions
  ) => {
    setState(prev => ({
      ...prev,
      isExporting: true,
      currentOperation: 'zip',
      progress: 0,
      currentScene: null,
      error: null
    }));

    try {
      const zipBlob = await exportManager.createSceneZip(scenes, options);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `brandscene_all_scenes_${timestamp}.zip`;
      exportManager.triggerDownload(zipBlob, filename);

      setState(prev => ({
        ...prev,
        isExporting: false,
        currentOperation: null,
        progress: 100,
        completedDownloads: [...prev.completedDownloads, ...scenes.map(s => s.id)]
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isExporting: false,
        currentOperation: null,
        error: error instanceof Error ? error.message : 'ZIP export failed'
      }));
    }
  }, [exportManager]);

  // Clear export state
  const clearExportState = useCallback(() => {
    setState({
      isExporting: false,
      currentOperation: null,
      progress: 0,
      currentScene: null,
      error: null,
      completedDownloads: []
    });
    exportManager.clearDownloadQueue();
    setDownloadProgress(new Map());
  }, [exportManager]);

  // Get progress for specific scene
  const getSceneProgress = useCallback((sceneId: string): DownloadProgress | undefined => {
    return downloadProgress.get(sceneId);
  }, [downloadProgress]);

  // Check if scene is completed
  const isSceneCompleted = useCallback((sceneId: string): boolean => {
    return state.completedDownloads.includes(sceneId);
  }, [state.completedDownloads]);

  // Monitor progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isExporting) {
        updateProgress();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [state.isExporting, updateProgress]);

  return {
    // State
    isExporting: state.isExporting,
    currentOperation: state.currentOperation,
    progress: state.progress,
    currentScene: state.currentScene,
    error: state.error,
    completedDownloads: state.completedDownloads,
    downloadProgress: Array.from(downloadProgress.values()),

    // Actions
    exportSingleScene,
    exportMultipleScenes,
    exportAsZip,
    clearExportState,
    getSceneProgress,
    isSceneCompleted
  };
};
