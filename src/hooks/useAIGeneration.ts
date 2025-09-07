import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { generateMultipleScenes, ReplicateServiceError } from '../services/replicate';
import { BrandInfo } from '../types';

export const useAIGeneration = () => {
  const { dispatch } = useAppContext();
  const { addToast } = useToast();

  const generateScenes = useCallback(async (brandInfo: BrandInfo) => {
    try {
      // Show generation started toast
      addToast({
        type: 'info',
        title: 'Generation Started',
        message: 'Creating your brand scenes...',
        duration: 3000
      });

      // Create generation request
      const generationRequest = {
        id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: `project_${Date.now()}`,
        status: 'pending' as const,
        progress: 0,
        startedAt: new Date(),
        scenes: []
      };
      
      dispatch({ type: 'START_GENERATION', payload: generationRequest });

      // Generate scenes with progress tracking using Replicate
      const scenes = await generateMultipleScenes(
        brandInfo,
        (progress, scene) => {
          dispatch({ 
            type: 'UPDATE_GENERATION_PROGRESS', 
            payload: { progress }
          });
          
          // Add each scene immediately as it's generated
          if (scene) {
            dispatch({ type: 'ADD_GENERATED_SCENE', payload: scene });
          }
        }
      );

      // Complete generation
      dispatch({ type: 'COMPLETE_GENERATION', payload: scenes });
      
      // Show success toast
      addToast({
        type: 'success',
        title: 'Generation Complete',
        message: `${scenes.length} scenes created successfully!`,
        duration: 5000
      });
      
      return scenes;

    } catch (error) {
      console.error('Generation failed:', error);
      
      let errorMessage = 'Generation failed';
      let errorTitle = 'Generation Error';
      
      if (error instanceof ReplicateServiceError) {
        errorMessage = error.message;
        errorTitle = 'Replicate Error';
        
        // Handle specific error types
        switch (error.code) {
          case 'DEVELOPMENT_MODE':
            errorTitle = 'Development Mode';
            errorMessage = 'Image generation requires deployment to test. Deploy to Vercel to enable the Replicate API integration.';
            break;
          case 'INVALID_API_KEY':
            errorTitle = 'Service Error';
            errorMessage = 'Please contact support for assistance.';
            break;
          case 'RATE_LIMIT_EXCEEDED':
            errorTitle = 'Rate Limit Exceeded';
            errorMessage = 'Please wait a moment before trying again.';
            break;
          case 'SERVICE_UNAVAILABLE':
            errorTitle = 'Service Unavailable';
            errorMessage = 'Replicate service is temporarily unavailable. Please try again later.';
            break;
          case 'TIMEOUT':
            errorTitle = 'Request Timeout';
            errorMessage = 'The request took too long. Please check your internet connection.';
            break;
          case 'NETWORK_ERROR':
            errorTitle = 'Network Error';
            errorMessage = 'Please check your internet connection and try again.';
            break;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'FAIL_GENERATION', payload: errorMessage });
      
      // Show error toast
      addToast({
        type: 'error',
        title: errorTitle,
        message: errorMessage,
        duration: 0 // Don't auto-dismiss for errors
      });
      
      throw error;
    }
  }, [dispatch, addToast]);

  const retryGeneration = useCallback(async (brandInfo: BrandInfo) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    
    addToast({
      type: 'info',
      title: 'Retrying Generation',
      message: 'Attempting to generate scenes again...',
      duration: 3000
    });
    
    return generateScenes(brandInfo);
  }, [generateScenes, dispatch, addToast]);

  return {
    generateScenes,
    retryGeneration
  };
};
