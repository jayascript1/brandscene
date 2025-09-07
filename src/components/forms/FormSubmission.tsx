import React, { useCallback } from 'react';
import { useForm } from '../../hooks/useForm';
import { useAIGeneration } from '../../hooks/useAIGeneration';
import { useAppContext } from '../../context/AppContext';
import { createProject } from '../../utils/formHelpers';
import { HoverCard, AnimatedLoader } from '../ui';

interface FormSubmissionProps {
  className?: string;
}

const FormSubmission: React.FC<FormSubmissionProps> = ({ className = '' }) => {
  const { formData, validateCurrentForm, canSubmit } = useForm();
  const { generateScenes } = useAIGeneration();
  const { dispatch } = useAppContext();

  const handleSubmit = useCallback(async () => {
    if (!canSubmit()) {
      validateCurrentForm();
      return;
    }

    try {
      // Create new project
      const project = createProject();
      dispatch({ type: 'CREATE_PROJECT', payload: project });
      
      // Set form as submitting
      dispatch({ type: 'SET_FORM_SUBMITTING', payload: true });
      
      // Generate scenes using the AI service
      await generateScenes(formData.brandInfo);
      
    } catch (error) {
      console.error('Generation failed:', error);
      // Error handling is done in the useAIGeneration hook
    } finally {
      dispatch({ type: 'SET_FORM_SUBMITTING', payload: false });
    }
  }, [canSubmit, validateCurrentForm, generateScenes, formData.brandInfo, dispatch]);

  return (
    <div className={`text-center ${className}`}>
      <HoverCard hoverEffect="glow" className="inline-block">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className={`text-lg px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
            canSubmit()
              ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
              : 'bg-dark-700 text-dark-400 cursor-not-allowed opacity-50'
          }`}
        >
          {formData.isSubmitting ? (
            <div className="flex items-center justify-center">
              <AnimatedLoader type="dots" size="sm" color="white" />
              <span className="ml-2">Generating...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2 animate-float">✨</span>
              Generate 4 Scenes
            </div>
          )}
        </button>
      </HoverCard>
      
      {!canSubmit() && (
        <p className="text-dark-400 text-sm mt-2 animate-fade-in">
          Please fix any validation errors before generating scenes
        </p>
      )}
      
      {formData.isSubmitting && (
        <div className="mt-4 animate-fade-in">
          <p className="text-dark-300 text-sm">
            Creating your brand scenes...
          </p>
        </div>
      )}
      
      {/* Development Notice */}
      {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg animate-fade-in">
          <p className="text-green-300 text-sm">
            <span className="font-medium">✅ Development Mode:</span> Image generation is now enabled! 
            The Replicate API integration is working in both development and production.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default FormSubmission;
