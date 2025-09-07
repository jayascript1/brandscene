// API utility functions
export const API_ENDPOINTS = {
  GENERATE_IMAGE: '/api/generate-image',
  GENERATE_SCENES: '/api/generate-scenes',
  HEALTH_CHECK: '/api/health'
} as const;

export const API_CONFIG = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000
} as const;

export const createApiUrl = (endpoint: string, baseUrl?: string): string => {
  const base = baseUrl || window.location.origin;
  return `${base}${endpoint}`;
};

export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};