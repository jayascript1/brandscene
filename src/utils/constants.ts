export const APP_CONFIG = {
  name: 'BrandScene',
  version: '1.0.0',
  maxFileSize: 15 * 1024 * 1024, // 15MB
  allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxScenesPerGeneration: 4,
  generationTimeout: 30000, // 30 seconds
} as const;

export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  fileSize: 'File size must be less than 15MB',
  fileType: 'File must be a JPEG, PNG, or WebP image',
  minLength: (min: number) => `Must be at least ${min} characters long`,
  maxLength: (max: number) => `Must be no more than ${max} characters long`,
  invalidEmail: 'Please enter a valid email address',
} as const;

export const PROMPT_TEMPLATES = {
  base: 'Create a professional advertising scene featuring {product} from {brand}. The scene should embody these brand values: {values}. Style: Modern, forward-thinking, visually striking, designed to stand out among competing ads. Include the product prominently in a realistic advertising context.',
  variations: [
    'Scene variation: Urban cityscape background with modern architecture.',
    'Scene variation: Natural outdoor environment with dramatic lighting.',
    'Scene variation: Minimalist studio setting with clean lines and shadows.',
    'Scene variation: Dynamic lifestyle scene with people and movement.'
  ]
} as const;

export const OPENAI_CONFIG = {
  model: 'dall-e-3',
  size: '1024x1024',
  quality: 'standard',
  n: 1,
  style: 'vivid',
  maxRetries: 3
} as const;
