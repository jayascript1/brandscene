import { ErrorInfo } from './errorHandling';

export interface ErrorReport {
  id: string;
  timestamp: Date;
  error: Error | string;
  context: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'api' | 'validation' | 'ui' | 'generation' | 'unknown';
  metadata?: Record<string, any>;
  stack?: string;
  componentStack?: string;
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorsByCategory: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  recentErrors: ErrorReport[];
  errorRate: number; // errors per minute
  mostCommonErrors: Array<{ error: string; count: number }>;
}

class ErrorMonitor {
  private errors: ErrorReport[] = [];
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean = true;
  private maxErrors: number = 100; // Keep last 100 errors
  private reportEndpoint?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadUserId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadUserId(): void {
    // In a real app, this would come from your auth system
    this.userId = localStorage.getItem('userId') || undefined;
  }

  private setupGlobalErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error, 'global', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, 'promise', {
        promise: event.promise
      });
    });

    // Network error monitoring
    this.setupNetworkMonitoring();
  }

  private setupNetworkMonitoring(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        // Log slow requests
        if (duration > 5000) { // 5 seconds
          this.captureError(
            new Error(`Slow network request: ${duration}ms`),
            'network',
            {
              url: args[0],
              duration,
              status: response.status
            }
          );
        }
        
        return response;
      } catch (error) {
        this.captureError(error as Error, 'network', {
          url: args[0],
          duration: Date.now() - startTime
        });
        throw error;
      }
    };
  }

  captureError(
    error: Error | string,
    context: string,
    metadata?: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    if (!this.isEnabled) return;

    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      error: error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
      severity,
      category: this.categorizeError(error),
      metadata,
      stack: error instanceof Error ? error.stack : undefined
    };

    this.errors.push(errorReport);
    
    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', errorReport);
    }

    // Send to error reporting service
    this.reportError(errorReport);
  }

  captureReactError(
    error: Error,
    errorInfo: ErrorInfo,
    context: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ): void {
    this.captureError(error, context, {
      componentStack: (errorInfo as any).componentStack,
      errorInfo
    }, severity);
  }

  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private categorizeError(error: Error | string): ErrorReport['category'] {
    const message = error instanceof Error ? error.message : String(error);
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
      return 'network';
    }
    if (lowerMessage.includes('api') || lowerMessage.includes('server') || lowerMessage.includes('http')) {
      return 'api';
    }
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || lowerMessage.includes('required')) {
      return 'validation';
    }
    if (lowerMessage.includes('generation') || lowerMessage.includes('ai') || lowerMessage.includes('replicate')) {
      return 'generation';
    }
    if (lowerMessage.includes('react') || lowerMessage.includes('component') || lowerMessage.includes('render')) {
      return 'ui';
    }
    return 'unknown';
  }

  private async reportError(errorReport: ErrorReport): Promise<void> {
    if (!this.reportEndpoint) return;

    try {
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });
    } catch (error) {
      // Don't log reporting errors to avoid infinite loops
      console.warn('Failed to report error:', error);
    }
  }

  setReportEndpoint(endpoint: string): void {
    this.reportEndpoint = endpoint;
  }

  setUserId(userId: string): void {
    this.userId = userId;
    localStorage.setItem('userId', userId);
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  getAnalytics(): ErrorAnalytics {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentErrors = this.errors.filter(error => error.timestamp > oneHourAgo);

    const errorsByCategory: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const errorMessages: Record<string, number> = {};

    this.errors.forEach(error => {
      // Count by category
      errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
      
      // Count by severity
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      
      // Count by error message
      const message = error.error instanceof Error ? error.error.message : error.error;
      errorMessages[message] = (errorMessages[message] || 0) + 1;
    });

    const mostCommonErrors = Object.entries(errorMessages)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: this.errors.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors,
      errorRate: recentErrors.length / 60, // errors per minute
      mostCommonErrors
    };
  }

  clearErrors(): void {
    this.errors = [];
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // Performance monitoring
  capturePerformanceMetric(name: string, duration: number, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.captureError(
      new Error(`Performance: ${name} took ${duration}ms`),
      'performance',
      {
        metricName: name,
        duration,
        ...metadata
      },
      duration > 1000 ? 'medium' : 'low'
    );
  }

  // User interaction monitoring
  captureUserAction(action: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.captureError(
      new Error(`User Action: ${action}`),
      'user-interaction',
      metadata,
      'low'
    );
  }

  // Generation-specific monitoring
  captureGenerationError(
    error: Error | string,
    sceneNumber: number,
    metadata?: Record<string, any>
  ): void {
    this.captureError(error, 'generation', {
      sceneNumber,
      ...metadata
    }, 'high');
  }

  // Network-specific monitoring
  captureNetworkError(
    error: Error | string,
    url: string,
    method: string,
    status?: number
  ): void {
    this.captureError(error, 'network', {
      url,
      method,
      status
    }, 'medium');
  }
}

// Singleton instance
export const errorMonitor = new ErrorMonitor();

// Convenience functions
export const captureError = (
  error: Error | string,
  context: string,
  metadata?: Record<string, any>,
  severity?: 'low' | 'medium' | 'high' | 'critical'
) => {
  errorMonitor.captureError(error, context, metadata, severity);
};

export const captureReactError = (
  error: Error,
  errorInfo: ErrorInfo,
  context: string,
  severity?: 'low' | 'medium' | 'high' | 'critical'
) => {
  errorMonitor.captureReactError(error, errorInfo, context, severity);
};

export const capturePerformanceMetric = (name: string, duration: number, metadata?: Record<string, any>) => {
  errorMonitor.capturePerformanceMetric(name, duration, metadata);
};

export const captureUserAction = (action: string, metadata?: Record<string, any>) => {
  errorMonitor.captureUserAction(action, metadata);
};

export const captureGenerationError = (error: Error | string, sceneNumber: number, metadata?: Record<string, any>) => {
  errorMonitor.captureGenerationError(error, sceneNumber, metadata);
};

export const captureNetworkError = (error: Error | string, url: string, method: string, status?: number) => {
  errorMonitor.captureNetworkError(error, url, method, status);
};

export default errorMonitor;
