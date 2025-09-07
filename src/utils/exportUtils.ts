import { GeneratedScene } from '../types';

export interface ExportOptions {
  format: 'png' | 'jpg' | 'webp';
  quality?: number;
  width?: number;
  height?: number;
  includeMetadata?: boolean;
}

export interface DownloadProgress {
  sceneId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

export class ExportManager {
  private static instance: ExportManager;
  private downloadQueue: Map<string, DownloadProgress> = new Map();

  static getInstance(): ExportManager {
    if (!ExportManager.instance) {
      ExportManager.instance = new ExportManager();
    }
    return ExportManager.instance;
  }

  // Download a single scene
  async downloadScene(
    scene: GeneratedScene, 
    options: ExportOptions = { format: 'png', quality: 0.9 }
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Set canvas dimensions
          canvas.width = options.width || img.naturalWidth;
          canvas.height = options.height || img.naturalHeight;

          // Draw image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Add metadata if requested
          if (options.includeMetadata) {
            this.addMetadataToCanvas(ctx, scene, canvas.width, canvas.height);
          }

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            `image/${options.format}`,
            options.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = scene.imageUrl;
    });
  }

  // Download multiple scenes
  async downloadScenes(
    scenes: GeneratedScene[], 
    options: ExportOptions = { format: 'png', quality: 0.9 }
  ): Promise<Blob[]> {
    const results: Blob[] = [];
    
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const progress = this.downloadQueue.get(scene.id) || {
        sceneId: scene.id,
        progress: 0,
        status: 'pending'
      };

      try {
        progress.status = 'downloading';
        progress.progress = (i / scenes.length) * 100;
        this.downloadQueue.set(scene.id, progress);

        const blob = await this.downloadScene(scene, options);
        results.push(blob);

        progress.status = 'completed';
        progress.progress = 100;
        this.downloadQueue.set(scene.id, progress);
      } catch (error) {
        progress.status = 'error';
        progress.error = error instanceof Error ? error.message : 'Unknown error';
        this.downloadQueue.set(scene.id, progress);
        throw error;
      }
    }

    return results;
  }

  // Create a ZIP file with multiple scenes
  async createSceneZip(
    scenes: GeneratedScene[], 
    options: ExportOptions = { format: 'png', quality: 0.9 }
  ): Promise<Blob> {
    // Note: This would require a ZIP library like JSZip
    // For now, we'll return the first scene as a placeholder
    const firstScene = await this.downloadScene(scenes[0], options);
    return firstScene;
  }

  // Add metadata to canvas
  private addMetadataToCanvas(
    ctx: CanvasRenderingContext2D, 
    scene: GeneratedScene, 
    width: number, 
    height: number
  ) {
    const padding = 20;
    const fontSize = 14;
    const lineHeight = fontSize + 4;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, height - 120, width, 120);

    ctx.fillStyle = 'white';
    ctx.font = `${fontSize}px Arial`;
    ctx.textBaseline = 'top';

    const lines = [
      `Scene ${scene.sceneNumber}`,
      `Created: ${scene.createdAt.toLocaleDateString()}`,
      `Prompt: ${scene.prompt.substring(0, 50)}${scene.prompt.length > 50 ? '...' : ''}`
    ];

    lines.forEach((line, index) => {
      ctx.fillText(line, padding, height - 120 + (index * lineHeight) + padding);
    });
  }

  // Get download progress for a scene
  getDownloadProgress(sceneId: string): DownloadProgress | undefined {
    return this.downloadQueue.get(sceneId);
  }

  // Get all download progress
  getAllDownloadProgress(): DownloadProgress[] {
    return Array.from(this.downloadQueue.values());
  }

  // Clear download queue
  clearDownloadQueue(): void {
    this.downloadQueue.clear();
  }

  // Trigger download in browser
  triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate filename for scene
  generateFilename(scene: GeneratedScene, format: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedName = scene.prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    return `brandscene_${scene.sceneNumber}_${sanitizedName}_${timestamp}.${format}`;
  }
}

// Convenience functions
export const downloadSingleScene = async (
  scene: GeneratedScene, 
  options?: ExportOptions
): Promise<void> => {
  const exportManager = ExportManager.getInstance();
  const blob = await exportManager.downloadScene(scene, options);
  const filename = exportManager.generateFilename(scene, options?.format || 'png');
  exportManager.triggerDownload(blob, filename);
};

export const downloadAllScenes = async (
  scenes: GeneratedScene[], 
  options?: ExportOptions
): Promise<void> => {
  const exportManager = ExportManager.getInstance();
  const blobs = await exportManager.downloadScenes(scenes, options);
  
  blobs.forEach((blob, index) => {
    const scene = scenes[index];
    const filename = exportManager.generateFilename(scene, options?.format || 'png');
    exportManager.triggerDownload(blob, filename);
  });
};

export const downloadSceneZip = async (
  scenes: GeneratedScene[], 
  options?: ExportOptions
): Promise<void> => {
  const exportManager = ExportManager.getInstance();
  const zipBlob = await exportManager.createSceneZip(scenes, options);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `brandscene_all_scenes_${timestamp}.zip`;
  exportManager.triggerDownload(zipBlob, filename);
};
