import { Component, ErrorInfo, ReactNode } from 'react';
import { NetworkError, ApiError, ValidationError } from '../../utils/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorType?: 'network' | 'api' | 'validation' | 'unknown';
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorType = ErrorBoundary.categorizeError(error);
    return { hasError: true, error, errorType };
  }

  static categorizeError(error: Error): 'network' | 'api' | 'validation' | 'unknown' {
    if (error instanceof NetworkError || error.message.includes('network') || error.message.includes('fetch')) {
      return 'network';
    }
    if (error instanceof ApiError || error.message.includes('API') || error.message.includes('server')) {
      return 'api';
    }
    if (error instanceof ValidationError || error.message.includes('validation') || error.message.includes('invalid')) {
      return 'validation';
    }
    return 'unknown';
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      errorType: ErrorBoundary.categorizeError(error)
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // In a real app, you might want to send this to an error reporting service
    // reportErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  renderErrorContent() {
    const { error, errorType } = this.state;
    const { context } = this.props;

    const getErrorIcon = () => {
      switch (errorType) {
        case 'network':
          return (
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M24 4l2.83 2.83L24 9.66l-2.83-2.83L24 4zM12 24l2.83-2.83L9.66 24l2.83 2.83L12 24zm12 0l-2.83 2.83L38.34 24l-2.83-2.83L24 24zM24 38.34l2.83 2.83L24 43.17l-2.83-2.83L24 38.34z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          );
        case 'api':
          return (
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M24 4l2.83 2.83L24 9.66l-2.83-2.83L24 4zM12 24l2.83-2.83L9.66 24l2.83 2.83L12 24zm12 0l-2.83 2.83L38.34 24l-2.83-2.83L24 24zM24 38.34l2.83 2.83L24 43.17l-2.83-2.83L24 38.34z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          );
        case 'validation':
          return (
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M24 4l2.83 2.83L24 9.66l-2.83-2.83L24 4zM12 24l2.83-2.83L9.66 24l2.83 2.83L12 24zm12 0l-2.83 2.83L38.34 24l-2.83-2.83L24 24zM24 38.34l2.83 2.83L24 43.17l-2.83-2.83L24 38.34z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          );
        default:
          return (
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M24 4l2.83 2.83L24 9.66l-2.83-2.83L24 4zM12 24l2.83-2.83L9.66 24l2.83 2.83L12 24zm12 0l-2.83 2.83L38.34 24l-2.83-2.83L24 24zM24 38.34l2.83 2.83L24 43.17l-2.83-2.83L24 38.34z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          );
      }
    };

    const getErrorTitle = () => {
      switch (errorType) {
        case 'network':
          return 'Connection Error';
        case 'api':
          return 'Service Error';
        case 'validation':
          return 'Validation Error';
        default:
          return 'Something went wrong';
      }
    };

    const getErrorMessage = () => {
      switch (errorType) {
        case 'network':
          return 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.';
        case 'api':
          return 'Our service is temporarily unavailable. Please try again in a few moments.';
        case 'validation':
          return 'There was an issue with the information you provided. Please check your input and try again.';
        default:
          return 'We encountered an unexpected error. Please try refreshing the page.';
      }
    };

    const getErrorColor = () => {
      switch (errorType) {
        case 'network':
          return 'text-orange-500';
        case 'api':
          return 'text-red-500';
        case 'validation':
          return 'text-yellow-500';
        default:
          return 'text-red-500';
      }
    };

    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-800 rounded-lg p-6 text-center">
          <div className={`mb-4 ${getErrorColor()}`}>
            {getErrorIcon()}
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-2">
            {getErrorTitle()}
          </h2>
          
          <p className="text-dark-300 mb-4">
            {getErrorMessage()}
          </p>

          {context && (
            <p className="text-dark-400 text-sm mb-4">
              Error occurred in: {context}
            </p>
          )}
          
          <div className="space-y-3">
            <button
              onClick={this.handleRetry}
              className="btn-primary w-full"
            >
              Try Again
            </button>
            
            <button
              onClick={this.handleRefresh}
              className="btn-secondary w-full"
            >
              Refresh Page
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-dark-400 cursor-pointer hover:text-dark-300">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-dark-700 rounded text-xs text-red-400 overflow-auto max-h-40">
                <div className="mb-2">
                  <strong>Error Type:</strong> {errorType}
                </div>
                <div className="mb-2">
                  <strong>Message:</strong> {error.message}
                </div>
                <pre className="whitespace-pre-wrap">{error.stack}</pre>
                {this.state.errorInfo && (
                  <div className="mt-2">
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return this.renderErrorContent();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
