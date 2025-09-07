import React from 'react';

// Error handling utilities

export interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
  timestamp: Date;
  userAgent?: string;
  url?: string;
  stack?: string;
}

export class AppError extends Error {
  public code: string;
  public status: number;
  public timestamp: Date;
  public userAgent: string;
  public url: string;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.timestamp = new Date();
    this.userAgent = navigator.userAgent;
    this.url = window.location.href;
  }

  toJSON(): ErrorInfo {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
      timestamp: this.timestamp,
      userAgent: this.userAgent,
      url: this.url,
      stack: this.stack
    };
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    if (field) {
      this.message = `${field}: ${message}`;
    }
  }
}

export class ApiError extends AppError {
  constructor(message: string, status: number = 500, code?: string) {
    super(message, code || 'API_ERROR', status);
    this.name = 'ApiError';
  }
}

// Error handler function
export const handleError = (error: Error | AppError, context?: string): ErrorInfo => {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else {
    appError = new AppError(error.message, 'UNKNOWN_ERROR', 500);
    appError.stack = error.stack;
  }

  // Add context if provided
  if (context) {
    appError.message = `[${context}] ${appError.message}`;
  }

  // Log error
  console.error('Error occurred:', appError.toJSON());

  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // reportErrorToService(appError);
  }

  return appError.toJSON();
};

// Async error wrapper
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error as Error, context);
      throw error;
    }
  };
};

// Error boundary helper
export const createErrorBoundary = (fallback?: React.ComponentType) => {
  return class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
      handleError(error, 'ErrorBoundary');
    }

    render() {
      if (this.state.hasError) {
        if (fallback) {
          return React.createElement(fallback);
        }
        return React.createElement('div', { className: 'error-boundary' },
          React.createElement('h2', null, 'Something went wrong'),
          React.createElement('button', { 
            onClick: () => this.setState({ hasError: false }) 
          }, 'Try again')
        );
      }

      return this.props.children;
    }
  };
};

// Network error detection
export const isNetworkError = (error: any): boolean => {
  return (
    error instanceof NetworkError ||
    error.code === 'NETWORK_ERROR' ||
    error.message?.includes('network') ||
    error.message?.includes('fetch') ||
    error.message?.includes('connection')
  );
};

// Retry mechanism
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries - 1) {
        throw lastError;
      }

      // Only retry network errors
      if (!isNetworkError(lastError)) {
        throw lastError;
      }

      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError!;
};

// Error reporting to external service (placeholder)
export const reportErrorToService = async (error: ErrorInfo): Promise<void> => {
  // In a real app, you would send this to a service like Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'development') {
    console.log('Error reported:', error);
  }
  
  // Example implementation:
  // await fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(error)
  // });
};
