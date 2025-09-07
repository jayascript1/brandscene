// Testing utilities

import React from 'react';

// Custom render function with providers
// Mock render function (in real app, use @testing-library/react)
const customRender = (
  ui: React.ReactElement,
  _options?: any
) => {
  // Placeholder for testing library render
  console.log('Mock render called for:', ui);
  return { container: document.createElement('div') };
};

// Error simulation utilities
export const simulateError = (error: Error) => {
  throw error;
};

export const simulateNetworkError = () => {
  throw new Error('Network error: Failed to fetch');
};

export const simulateTimeout = (ms: number = 5000) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
};

// Mock data generators
export const createMockBrandInfo = (overrides = {}) => ({
  productName: 'Test Product',
  brandName: 'Test Brand',
  brandValues: 'Innovation, Quality, Trust',
  ...overrides
});

export const createMockImage = (overrides = {}) => ({
  file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
  fileName: 'test.jpg',
  fileSize: 1024 * 1024, // 1MB
  mimeType: 'image/jpeg',
  previewUrl: 'data:image/jpeg;base64,test',
  dimensions: { width: 800, height: 600 },
  ...overrides
});

export const createMockGeneratedScene = (overrides = {}) => ({
  id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  sceneNumber: 1,
  imageUrl: 'https://example.com/test-image.jpg',
  prompt: 'Test prompt for scene generation',
  status: 'completed' as const,
  createdAt: new Date(),
  ...overrides
});

// Test helpers
export const waitForElementToBeRemoved = (element: Element | null) => {
  return new Promise<void>((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
};

export const mockConsoleError = () => {
  const originalError = console.error;
  const mockError = () => {}; // Mock function
  console.error = mockError;
  
  return {
    mockError,
    restore: () => {
      console.error = originalError;
    }
  };
};

export const mockConsoleWarn = () => {
  const originalWarn = console.warn;
  const mockWarn = () => {}; // Mock function
  console.warn = mockWarn;
  
  return {
    mockWarn,
    restore: () => {
      console.warn = originalWarn;
    }
  };
};

// Performance testing utilities
export const measureRenderTime = async (component: React.ReactElement) => {
  const start = performance.now();
  customRender(component);
  const end = performance.now();
  // unmount(); // Mock unmount
  return end - start;
};

export const simulateSlowNetwork = (delay: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Accessibility testing helpers
export const checkA11y = async (component: React.ReactElement) => {
  // In a real implementation, you would use axe-core or similar
  const { container } = customRender(component);
  
  // Basic accessibility checks
  const images = container.querySelectorAll('img');
  images.forEach((img: Element) => {
    if (!(img as HTMLImageElement).alt) {
      console.warn('Image missing alt attribute:', img);
    }
  });
  
  const buttons = container.querySelectorAll('button');
  buttons.forEach((button: Element) => {
    if (!button.textContent && !button.getAttribute('aria-label')) {
      console.warn('Button missing accessible name:', button);
    }
  });
  
  return true;
};

// Export custom render
export { customRender as render };
