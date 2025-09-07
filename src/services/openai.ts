import axios, { AxiosError } from 'axios';
import { OPENAI_CONFIG } from '../utils/constants';
import { BrandInfo, GeneratedScene } from '../types';

// Secure API key from environment variable
const SECURE_API_KEY = process.env.OPENAI_API_KEY || '';

// Create axios instance with OpenAI configuration
const openaiApi = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Authorization': `Bearer ${SECURE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout
});

// Error types for better error handling
export class OpenAIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: OPENAI_CONFIG.maxRetries,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Exponential backoff retry function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const exponentialBackoff = (attempt: number): number => {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
    RETRY_CONFIG.maxDelay
  );
  return delay + Math.random() * 1000; // Add jitter
};

// Enhanced prompt engineering
export const buildBrandPrompt = (brandInfo: BrandInfo): string => {
  const { brandName, productName, brandValues } = brandInfo;
  
  let prompt = 'Create a professional advertising scene featuring ';
  
  if (productName.trim()) {
    prompt += `"${productName}"`;
  } else {
    prompt += 'the product';
  }
  
  if (brandName.trim()) {
    prompt += ` from "${brandName}"`;
  }
  
  prompt += '. ';
  
  if (brandValues.trim()) {
    const values = brandValues
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);
    
    if (values.length > 0) {
      prompt += `Whilst all design and structural integrity from the main subject should be adhered to, the scene should embody these brand values: ${values.join(', ')}. `;
    }
  }
  
  prompt += 'Style: Modern, forward-thinking, visually striking, designed to stand out among competing ads. Include the product prominently in a realistic advertising context. High quality, professional photography style.';
  
  return prompt;
};

// Generate scene variations
export const generateSceneVariations = (basePrompt: string): string[] => {
  const variations = [
    `${basePrompt} Scene variation: Urban cityscape background with modern architecture and dynamic lighting.`,
    `${basePrompt} Scene variation: Natural outdoor environment with dramatic lighting and organic elements.`,
    `${basePrompt} Scene variation: Minimalist studio setting with clean lines, shadows, and sophisticated composition.`,
    `${basePrompt} Scene variation: Dynamic lifestyle scene with people, movement, and contemporary urban setting.`
  ];
  
  return variations;
};

// Main image generation function with retry logic
export const generateImage = async (
  prompt: string,
  retryCount = 0
): Promise<{ url: string; revisedPrompt?: string }> => {
  try {
    const response = await openaiApi.post('/images/generations', {
      model: OPENAI_CONFIG.model,
      prompt,
      n: 1,
      size: OPENAI_CONFIG.size,
      quality: OPENAI_CONFIG.quality,
      style: OPENAI_CONFIG.style,
    });

    const data = response.data;
    
    if (!data.data || data.data.length === 0) {
      throw new OpenAIError('No image data received from OpenAI');
    }

    return {
      url: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt
    };

  } catch (error) {
    const axiosError = error as AxiosError;
    
    // Handle specific OpenAI errors
    if (axiosError.response) {
      const status = axiosError.response.status;
      const errorData = axiosError.response.data as any;
      
      switch (status) {
        case 401:
          throw new OpenAIError(
            'Invalid API key. Please contact support.',
            status,
            'INVALID_API_KEY'
          );
        case 429:
          throw new OpenAIError(
            'Rate limit exceeded. Please wait before making another request.',
            status,
            'RATE_LIMIT_EXCEEDED'
          );
        case 400:
          const errorMessage = errorData.error?.message || 'Invalid request';
          throw new OpenAIError(
            `Request error: ${errorMessage}`,
            status,
            'INVALID_REQUEST'
          );
        case 500:
        case 502:
        case 503:
        case 504:
          throw new OpenAIError(
            'OpenAI service temporarily unavailable. Please try again.',
            status,
            'SERVICE_UNAVAILABLE'
          );
        default:
          throw new OpenAIError(
            `Unexpected error: ${errorData.error?.message || 'Unknown error'}`,
            status,
            'UNKNOWN_ERROR'
          );
      }
    }
    
    // Handle network errors
    if (axiosError.code === 'ECONNABORTED') {
      throw new OpenAIError(
        'Request timeout. Please check your internet connection.',
        408,
        'TIMEOUT'
      );
    }
    
    if (axiosError.code === 'NETWORK_ERROR') {
      throw new OpenAIError(
        'Network error. Please check your internet connection.',
        0,
        'NETWORK_ERROR'
      );
    }
    
    // Retry logic for transient errors
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const retryDelay = exponentialBackoff(retryCount);
      await delay(retryDelay);
      return generateImage(prompt, retryCount + 1);
    }
    
    // If we've exhausted retries, throw the error
    throw new OpenAIError(
      `Failed to generate image after ${RETRY_CONFIG.maxRetries} attempts: ${axiosError.message}`,
      0,
      'MAX_RETRIES_EXCEEDED'
    );
  }
};

// Batch generation function
export const generateMultipleScenes = async (
  brandInfo: BrandInfo,
  onProgress?: (progress: number, scene?: GeneratedScene) => void
): Promise<GeneratedScene[]> => {
  const basePrompt = buildBrandPrompt(brandInfo);
  const scenePrompts = generateSceneVariations(basePrompt);
  const generatedScenes: GeneratedScene[] = [];
  
  for (let i = 0; i < scenePrompts.length; i++) {
    const prompt = scenePrompts[i];
    
    try {
      // Update progress
      onProgress?.((i / scenePrompts.length) * 100);
      
      const result = await generateImage(prompt);
      
      const scene: GeneratedScene = {
        id: `scene_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        sceneNumber: i + 1,
        imageUrl: result.url,
        prompt: result.revisedPrompt || prompt,
        status: 'completed',
        createdAt: new Date()
      };
      
      generatedScenes.push(scene);
      
      // Update progress with completed scene
      onProgress?.(((i + 1) / scenePrompts.length) * 100, scene);
      
    } catch (error) {
      // Only log unexpected errors to reduce console noise
      const isExpectedError = error instanceof OpenAIError && (
        error.code === 'SERVICE_UNAVAILABLE' || 
        error.code === 'RATE_LIMIT_EXCEEDED' ||
        error.code === 'TIMEOUT'
      );
      
      if (!isExpectedError) {
        console.error(`Failed to generate scene ${i + 1}:`, error);
      }
      
      const failedScene: GeneratedScene = {
        id: `scene_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        sceneNumber: i + 1,
        imageUrl: '',
        prompt,
        status: 'error',
        createdAt: new Date()
      };
      
      generatedScenes.push(failedScene);
      
      // Continue with next scene even if one fails
      onProgress?.(((i + 1) / scenePrompts.length) * 100, failedScene);
    }
  }
  
  return generatedScenes;
};

// Utility function to validate API key
export const validateApiKey = async (): Promise<boolean> => {
  try {
    await openaiApi.get('/models');
    return true;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      return false;
    }
    // For other errors, we'll assume the key is valid but there's a different issue
    return true;
  }
};
