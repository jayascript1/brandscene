import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  Project, 
  BrandInfo, 
  GeneratedScene, 
  AppState, 
  FormData, 
  GenerationRequest,
  UploadedImage
} from '../types';

type AppAction =
  // Project actions
  | { type: 'CREATE_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Partial<Project> }
  | { type: 'SET_CURRENT_PAGE'; payload: 'create' | 'results' }
  
  // Form actions
  | { type: 'UPDATE_BRAND_INFO'; payload: Partial<BrandInfo> }
  | { type: 'SET_IMAGE'; payload: UploadedImage | undefined }
  | { type: 'SET_FORM_SUBMITTING'; payload: boolean }
  | { type: 'SET_FORM_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_FORM_ERRORS' }
  | { type: 'RESET_FORM' }
  
  // Generation actions
  | { type: 'START_GENERATION'; payload: GenerationRequest }
  | { type: 'UPDATE_GENERATION_PROGRESS'; payload: { progress: number; scenes?: GeneratedScene[] } }
  | { type: 'ADD_GENERATED_SCENE'; payload: GeneratedScene }
  | { type: 'COMPLETE_GENERATION'; payload: GeneratedScene[] }
  | { type: 'FAIL_GENERATION'; payload: string }
  
  // Scene actions
  | { type: 'SET_GENERATED_SCENES'; payload: GeneratedScene[] }
  | { type: 'UPDATE_SCENE'; payload: { id: string; updates: Partial<GeneratedScene> } }
  | { type: 'DOWNLOAD_SCENE'; payload: string }
  
  // Global actions
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

const initialFormData: FormData = {
  brandInfo: {
    brandName: '',
    productName: '',
    productDescription: '',
    brandValues: '',
    imageDimensions: 'square'
  },
  isSubmitting: false,
  errors: {}
};

const initialState: AppState = {
  currentProject: null,
  formData: initialFormData,
  generatedScenes: [],
  generationRequest: null,
  isLoading: false,
  error: null,
  currentPage: 'create'
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    // Project actions
    case 'CREATE_PROJECT':
      return { 
        ...state, 
        currentProject: action.payload,
        currentPage: 'create'
      };
      
    case 'UPDATE_PROJECT':
      return {
        ...state,
        currentProject: state.currentProject 
          ? { ...state.currentProject, ...action.payload }
          : null
      };
      
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    
    // Form actions
    case 'UPDATE_BRAND_INFO':
      return {
        ...state,
        formData: {
          ...state.formData,
          brandInfo: {
            ...state.formData.brandInfo,
            ...action.payload
          }
        }
      };
      
    case 'SET_IMAGE':
      return {
        ...state,
        formData: {
          ...state.formData,
          image: action.payload
        }
      };
      
    case 'SET_FORM_SUBMITTING':
      return {
        ...state,
        formData: {
          ...state.formData,
          isSubmitting: action.payload
        }
      };
      
    case 'SET_FORM_ERROR':
      return {
        ...state,
        formData: {
          ...state.formData,
          errors: {
            ...state.formData.errors,
            [action.payload.field]: action.payload.message
          }
        }
      };
      
    case 'CLEAR_FORM_ERRORS':
      return {
        ...state,
        formData: {
          ...state.formData,
          errors: {}
        }
      };
      
    case 'RESET_FORM':
      return {
        ...state,
        formData: initialFormData
      };
    
    // Generation actions
    case 'START_GENERATION':
      return {
        ...state,
        generationRequest: action.payload,
        generatedScenes: [], // Clear previous scenes
        isLoading: true,
        error: null
        // Don't change currentPage - stay on create page
      };
      
    case 'UPDATE_GENERATION_PROGRESS':
      return {
        ...state,
        generationRequest: state.generationRequest 
          ? {
              ...state.generationRequest,
              progress: action.payload.progress,
              scenes: action.payload.scenes || state.generationRequest.scenes
            }
          : null
      };
      
    case 'ADD_GENERATED_SCENE':
      return {
        ...state,
        generatedScenes: [...state.generatedScenes, action.payload]
      };
      
    case 'COMPLETE_GENERATION':
      return {
        ...state,
        generatedScenes: action.payload,
        generationRequest: state.generationRequest 
          ? {
              ...state.generationRequest,
              status: 'completed',
              progress: 100,
              completedAt: new Date()
            }
          : null,
        isLoading: false
      };
      
    case 'FAIL_GENERATION':
      return {
        ...state,
        generationRequest: state.generationRequest 
          ? {
              ...state.generationRequest,
              status: 'failed',
              errorMessage: action.payload,
              completedAt: new Date()
            }
          : null,
        isLoading: false,
        error: action.payload
      };
    
    // Scene actions
    case 'SET_GENERATED_SCENES':
      return { ...state, generatedScenes: action.payload };
      
    case 'UPDATE_SCENE':
      return {
        ...state,
        generatedScenes: state.generatedScenes.map(scene =>
          scene.id === action.payload.id
            ? { ...scene, ...action.payload.updates }
            : scene
        )
      };
      
    case 'DOWNLOAD_SCENE':
      return {
        ...state,
        generatedScenes: state.generatedScenes.map(scene =>
          scene.id === action.payload
            ? { ...scene, downloadedAt: new Date() }
            : scene
        )
      };
    
    // Global actions
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
