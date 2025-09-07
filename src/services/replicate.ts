import { BrandInfo, GeneratedScene, ReplicateError, ReplicatePrediction } from '../types';

// API Configuration
const API_BASE_URL = '/api'; // Use Vite proxy in development, Vercel functions in production

// Replicate model configuration
const REPLICATE_CONFIG = {
  model: 'google/gemini-2.5-flash-image', // Using Gemini Flash 2.5
  // We'll determine the version during initialization
  webhook: undefined, // We'll handle polling instead
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

// Custom error class for Replicate
export class ReplicateServiceError extends Error implements ReplicateError {
  status?: number;
  code?: string;
  prediction?: ReplicatePrediction;

  constructor(
    message: string,
    status?: number,
    code?: string,
    prediction?: ReplicatePrediction
  ) {
    super(message);
    this.name = 'ReplicateServiceError';
    this.status = status;
    this.code = code;
    this.prediction = prediction;
  }
}

// Utility functions
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const exponentialBackoff = (attempt: number): number => 
  Math.min(RETRY_CONFIG.baseDelay * Math.pow(2, attempt), RETRY_CONFIG.maxDelay);

// API calling functions
const callAPI = async (action: string, data: any) => {
  // In development, we can still make API calls to the Vercel function
  // The Vercel function will handle the Replicate API calls server-side
  
  console.log(`Making API call to: ${API_BASE_URL}/replicate`);
  
  const response = await fetch(`${API_BASE_URL}/replicate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      ...data
    })
  });

  console.log(`API response status: ${response.status}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ReplicateServiceError(
      errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData.error?.code || 'API_ERROR'
    );
  }

  const result = await response.json();
  if (!result.success) {
    throw new ReplicateServiceError(
      result.error?.message || 'API call failed',
      result.error?.status || 500,
      result.error?.code || 'API_ERROR'
    );
  }

  return result;
};

const createPrediction = async (model: string, input: any) => {
  const result = await callAPI('createPrediction', { model, input });
  return result.prediction;
};

const getPrediction = async (id: string) => {
  const result = await callAPI('getPrediction', { id });
  return result.prediction;
};


// Build focused prompt for Replicate - optimized for product generation from description
export const buildReplicatePrompt = (brandInfo: BrandInfo, sceneType: string): string => {
  // Start with product description and brand context
  let prompt = `Create a professional product image of ${brandInfo.productName}. `;
  
  // Add product description for better generation context
  if (brandInfo.productDescription) {
    prompt += `This is a ${brandInfo.productDescription.toLowerCase()}. `;
  }
  
  // Add brand context if available
  if (brandInfo.brandName) {
    prompt += `Brand: ${brandInfo.brandName}. `;
  }
  
  // Add brand values for styling
  if (brandInfo.brandValues) {
    const values = brandInfo.brandValues
      .split(/[,;]/)
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .slice(0, 3); // Limit to first 3 values to avoid overwhelming the model
    
    if (values.length > 0) {
      prompt += `Design style: ${values.join(', ')}. `;
    }
  }
  
  // Add scene context
  prompt += `Scene: ${sceneType.toLowerCase()}. `;
  
  // Add quality instructions
  prompt += `Professional product photography, photorealistic, high quality, detailed, commercial-grade image.`;
  
  return prompt;
};


// Generate scene variations with different contexts - focused on product placement
export const generateSceneVariations = (brandInfo: BrandInfo): string[] => {
  const variations = [
    `Urban cityscape background with modern architecture and dynamic lighting`,
    `Natural outdoor environment with dramatic lighting and organic elements`,
    `Minimalist studio setting with clean lines, shadows, and sophisticated composition`,
    `Dynamic lifestyle scene with people, movement, and contemporary urban setting`
  ];
  
  return variations.map(variation => buildReplicatePrompt(brandInfo, variation));
};

// Main image generation function with retry logic
export const generateImage = async (
  prompt: string,
  dimensions: 'square' | 'portrait' | 'landscape' = 'square',
  retryCount = 0
): Promise<{ url: string; revisedPrompt?: string }> => {
  try {
    // Map dimensions to aspect ratio instructions for Gemini Flash 2.5
    const aspectRatioInstructions = {
      square: "The image should be in a 1:1 (square) aspect ratio.",
      portrait: "The image should be in a 9:16 (portrait) aspect ratio.",
      landscape: "The image should be in a 16:9 (landscape) aspect ratio."
    };
    
    // Add aspect ratio instruction to the prompt
    const enhancedPrompt = `${prompt} ${aspectRatioInstructions[dimensions]}`;
    
    // Create prediction using Gemini 2.5 Flash parameters
    const prediction = await createPrediction(REPLICATE_CONFIG.model, {
      prompt: enhancedPrompt,
      steps: 25,              // More inference steps for better quality
      temperature: 0.1,       // Lower temperature for more deterministic results
      seed: Math.floor(Math.random() * 1000000) // Random seed for variety
    });

    // Poll for completion
    let finalPrediction = prediction;
    let pollAttempts = 0;
    const maxPollAttempts = 60; // 5 minutes with 5-second intervals
    
    while (
      finalPrediction.status === 'starting' || 
      finalPrediction.status === 'processing'
    ) {
      if (pollAttempts >= maxPollAttempts) {
        throw new ReplicateServiceError(
          'Generation timeout - took longer than expected',
          408,
          'TIMEOUT',
          finalPrediction as ReplicatePrediction
        );
      }
      
      await delay(3000); // Wait 3 seconds between polls (more efficient)
      finalPrediction = await getPrediction(finalPrediction.id);
      pollAttempts++;
    }

    if (finalPrediction.status === 'failed') {
      const errorMessage = typeof finalPrediction.error === 'string' 
        ? finalPrediction.error 
        : (finalPrediction.error as any)?.message || 'Generation failed';
      throw new ReplicateServiceError(
        errorMessage,
        500,
        'GENERATION_FAILED',
        finalPrediction as ReplicatePrediction
      );
    }

    if (finalPrediction.status === 'canceled' || finalPrediction.status === 'aborted') {
      throw new ReplicateServiceError(
        'Generation was canceled',
        400,
        'GENERATION_CANCELED',
        finalPrediction as ReplicatePrediction
      );
    }

    // Add debugging to see what we're getting
    console.log('Final prediction:', finalPrediction);
    console.log('Output type:', typeof finalPrediction.output);
    console.log('Output value:', finalPrediction.output);

    // Handle different output formats
    let imageUrl: string;
    
    if (finalPrediction.output) {
      if (Array.isArray(finalPrediction.output) && finalPrediction.output.length > 0) {
        // Standard array format
        imageUrl = finalPrediction.output[0];
      } else if (typeof finalPrediction.output === 'string') {
        // Direct string format
        imageUrl = finalPrediction.output;
      } else if (typeof finalPrediction.output === 'object' && finalPrediction.output !== null) {
        // Object format - try to find image URL
        const outputObj = finalPrediction.output as any;
        if (outputObj.url) {
          imageUrl = outputObj.url;
        } else if (outputObj.image) {
          imageUrl = outputObj.image;
        } else {
          // Try to find any string property that looks like a URL
          const urlProps = Object.values(outputObj).filter(val => 
            typeof val === 'string' && val.startsWith('http')
          );
          if (urlProps.length > 0) {
            imageUrl = urlProps[0] as string;
          } else {
            throw new ReplicateServiceError(
              'Unexpected output format from Nano Banana model',
              500,
              'UNEXPECTED_OUTPUT_FORMAT',
              finalPrediction as ReplicatePrediction
            );
          }
        }
      } else {
        throw new ReplicateServiceError(
          'No image data received from Replicate',
          500,
          'NO_OUTPUT',
          finalPrediction as ReplicatePrediction
        );
      }
    } else {
      throw new ReplicateServiceError(
        'No image data received from Replicate',
        500,
        'NO_OUTPUT',
        finalPrediction as ReplicatePrediction
      );
    }

    // Return the generated image URL
    return {
      url: imageUrl,
      revisedPrompt: prompt // Replicate doesn't revise prompts like DALL-E
    };

  } catch (error) {
    console.error('Replicate generation error:', error);
    
    // Handle Replicate-specific errors
    if (error instanceof ReplicateServiceError) {
      // Handle specific error codes
      switch (error.code) {
        case 'TIMEOUT':
          if (retryCount < RETRY_CONFIG.maxRetries) {
            const retryDelay = exponentialBackoff(retryCount);
            await delay(retryDelay);
            return generateImage(prompt, dimensions, retryCount + 1);
          }
          throw error;
          
        case 'GENERATION_FAILED':
          throw new ReplicateServiceError(
            'Replicate service temporarily unavailable. Please try again.',
            500,
            'SERVICE_UNAVAILABLE'
          );
          
        default:
          throw error;
      }
    }
    
    // Handle network errors
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        throw new ReplicateServiceError(
          'Network error. Please check your internet connection.',
          0,
          'NETWORK_ERROR'
        );
      }
      
      // Handle authentication errors
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        throw new ReplicateServiceError(
          'Invalid API key. Please check your Replicate API token.',
          401,
          'INVALID_API_KEY'
        );
      }
      
      // Handle rate limiting
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw new ReplicateServiceError(
          'Rate limit exceeded. Please wait before making another request.',
          429,
          'RATE_LIMIT_EXCEEDED'
        );
      }
    }
    
    // Retry logic for transient errors
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const retryDelay = exponentialBackoff(retryCount);
      await delay(retryDelay);
      return generateImage(prompt, dimensions, retryCount + 1);
    }
    
    // If we've exhausted retries, throw the error
    throw new ReplicateServiceError(
      `Failed to generate image after ${RETRY_CONFIG.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
  const scenePrompts = generateSceneVariations(brandInfo);
  
  // Generate all scenes in parallel for better efficiency
  const promises = scenePrompts.map(async (prompt, i) => {
    try {
      // Update progress for each scene start
      onProgress?.((i / scenePrompts.length) * 100);
      
      const result = await generateImage(prompt, brandInfo.imageDimensions);
      
      const scene: GeneratedScene = {
        id: `scene_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        sceneNumber: i + 1,
        imageUrl: result.url,
        prompt: result.revisedPrompt || prompt,
        status: 'completed',
        createdAt: new Date()
      };
      
      // Update progress when scene completes
      onProgress?.(((i + 1) / scenePrompts.length) * 100, scene);
      
      return scene;
      
    } catch (error) {
      // Only log unexpected errors to reduce console noise
      const isExpectedError = error instanceof ReplicateServiceError && (
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
      
      return failedScene;
    }
  });
  
  // Wait for all scenes to complete (parallel execution)
  const generatedScenes = await Promise.all(promises);
  
  return generatedScenes;
};

// Utility function to validate API key
export const validateReplicateApiKey = async (): Promise<boolean> => {
  try {
    // Try to make a test API call to validate the connection
    // This will be handled by the backend which has the actual API key
    await callAPI('createPrediction', {
      model: 'stability-ai/stable-diffusion', // Using Stable Diffusion for better product preservation
      input: { prompt: 'test' } // Minimal test input
    });
    return true;
  } catch (error) {
    if (error instanceof ReplicateServiceError && (
      error.status === 401 || 
      error.code === 'INVALID_API_KEY'
    )) {
      return false;
    }
    // For other errors, we'll assume the key is valid but there's a different issue
    return true;
  }
};

export default {
  generateImage,
  generateMultipleScenes,
  validateReplicateApiKey,
  ReplicateServiceError
};