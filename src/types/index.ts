export interface Project {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'generating' | 'completed' | 'error';
  name?: string;
}

export interface BrandInfo {
  brandName: string;
  productName: string;
  productDescription: string;
  brandValues: string;
  imageDimensions: 'square' | 'portrait' | 'landscape';
}

export interface GeneratedScene {
  id: string;
  sceneNumber: number;
  imageUrl: string;
  prompt: string;
  status: 'pending' | 'completed' | 'error';
  createdAt: Date;
  downloadedAt?: Date;
}

export interface UploadedImage {
  file: File;
  previewUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface GenerationRequest {
  id: string;
  projectId: string;
  openaiRequestId?: string;
  replicateRequestId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  scenes: GeneratedScene[];
}

export interface ReplicateConfig {
  model: string;
  version?: string;
  webhook?: string;
}

export interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'aborted';
  input: any;
  output?: any;
  error?: any;
  created_at: string;
  completed_at?: string;
}

export interface ReplicateError extends Error {
  status?: number;
  code?: string;
  prediction?: ReplicatePrediction;
}

export interface ImageGenerationInput {
  prompt: string;
  image?: File | string; // File object or base64 string
  brandInfo: BrandInfo;
}

export interface AIProvider {
  name: 'replicate';
  generateImage: (input: ImageGenerationInput) => Promise<{ url: string; revisedPrompt?: string }>;
  generateMultipleScenes: (
    brandInfo: BrandInfo,
    onProgress?: (progress: number, scene?: GeneratedScene) => void
  ) => Promise<GeneratedScene[]>;
}

export interface FormData {
  brandInfo: BrandInfo;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export interface AppState {
  currentProject: Project | null;
  formData: FormData;
  generatedScenes: GeneratedScene[];
  generationRequest: GenerationRequest | null;
  isLoading: boolean;
  error: string | null;
  currentPage: 'create' | 'results';
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
}
