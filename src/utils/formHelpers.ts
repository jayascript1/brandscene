import { UploadedImage, BrandInfo } from '../types';
import { validateFile, getImageDimensions } from './validation';

export const handleFileUpload = async (file: File): Promise<UploadedImage> => {
  const validation = validateFile(file);
  
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const previewUrl = URL.createObjectURL(file);
  const dimensions = await getImageDimensions(file);

  return {
    file,
    previewUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    dimensions
  };
};

export const createProject = (): { id: string; createdAt: Date; updatedAt: Date; status: 'draft' } => {
  const now = new Date();
  return {
    id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    status: 'draft'
  };
};

export const buildPrompt = (brandInfo: BrandInfo): string => {
  const { brandName, productName, brandValues } = brandInfo;
  
  let prompt = `Create a professional advertising scene featuring `;
  
  if (productName.trim()) {
    prompt += `${productName}`;
  } else {
    prompt += `the product`;
  }
  
  if (brandName.trim()) {
    prompt += ` from ${brandName}`;
  }
  
  prompt += `. `;
  
  if (brandValues.trim()) {
    const values = brandValues.split(',').map(v => v.trim()).filter(v => v);
    prompt += `The scene should embody these brand values: ${values.join(', ')}. `;
  }
  
  prompt += `Style: Modern, forward-thinking, visually striking, designed to stand out among competing ads. Include the product prominently in a realistic advertising context.`;
  
  return prompt;
};

export const generateScenePrompts = (basePrompt: string): string[] => {
  const variations = [
    `${basePrompt} Scene variation: Urban cityscape background with modern architecture.`,
    `${basePrompt} Scene variation: Natural outdoor environment with dramatic lighting.`,
    `${basePrompt} Scene variation: Minimalist studio setting with clean lines and shadows.`,
    `${basePrompt} Scene variation: Dynamic lifestyle scene with people and movement.`
  ];
  
  return variations;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const formatBrandValues = (values: string): string[] => {
  return values
    .split(',')
    .map(v => v.trim())
    .filter(v => v.length > 0);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
