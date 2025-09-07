import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { validateForm } from '../utils/validation';
import { buildPrompt } from '../utils/formHelpers';
import { BrandInfo } from '../types';

export const useForm = () => {
  const { state, dispatch } = useAppContext();

  const updateBrandInfo = useCallback((updates: Partial<BrandInfo>) => {
    dispatch({ type: 'UPDATE_BRAND_INFO', payload: updates });
  }, [dispatch]);

  const validateCurrentForm = useCallback(() => {
    const errors = validateForm({
      brandInfo: state.formData.brandInfo
    });

    // Clear previous errors
    dispatch({ type: 'CLEAR_FORM_ERRORS' });

    // Set new errors
    errors.forEach(error => {
      dispatch({ type: 'SET_FORM_ERROR', payload: error });
    });

    return errors.length === 0;
  }, [state.formData, dispatch]);

  const isFormValid = useCallback(() => {
    return Object.keys(state.formData.errors).length === 0;
  }, [state.formData]);

  const canSubmit = useCallback(() => {
    return isFormValid() && !state.formData.isSubmitting;
  }, [isFormValid, state.formData.isSubmitting]);

  const getPrompt = useCallback(() => {
    return buildPrompt(state.formData.brandInfo);
  }, [state.formData.brandInfo]);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, [dispatch]);

  return {
    formData: state.formData,
    updateBrandInfo,
    validateCurrentForm,
    isFormValid,
    canSubmit,
    getPrompt,
    resetForm,
    errors: state.formData.errors
  };
};
