import React from 'react';
import { HoverCard, TransitionWrapper } from './index';

interface FallbackStatesProps {
  type: 'generation-failed' | 'partial-failure' | 'network-error' | 'service-unavailable' | 'timeout';
  error?: string;
  retryCount?: number;
  maxRetries?: number;
  onRetry?: () => void;
  onBack?: () => void;
  className?: string;
}

const FallbackStates: React.FC<FallbackStatesProps> = ({
  type,
  error,
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  onBack,
  className = ''
}) => {
  const getFallbackContent = () => {
    switch (type) {
      case 'generation-failed':
        return {
          icon: (
            <svg className="mx-auto h-16 w-16" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M24 4l2.83 2.83L24 9.66l-2.83-2.83L24 4zM12 24l2.83-2.83L9.66 24l2.83 2.83L12 24zm12 0l-2.83 2.83L38.34 24l-2.83-2.83L24 24zM24 38.34l2.83 2.83L24 43.17l-2.83-2.83L24 38.34z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          title: 'Generation Failed',
          message: 'We couldn\'t generate your scenes. This might be due to high demand or a temporary issue.',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          suggestions: [
            'Check your internet connection',
            'Try again in a few minutes',
            'Verify your image meets our requirements',
            'Contact support if the problem persists'
          ]
        };

      case 'partial-failure':
        return {
          icon: (
            <svg className="mx-auto h-16 w-16" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M24 4l2.83 2.83L24 9.66l-2.83-2.83L24 4zM12 24l2.83-2.83L9.66 24l2.83 2.83L12 24zm12 0l-2.83 2.83L38.34 24l-2.83-2.83L24 24zM24 38.34l2.83 2.83L24 43.17l-2.83-2.83L24 38.34z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          title: 'Partial Generation Complete',
          message: 'Some scenes were generated successfully, but others failed. You can retry the failed ones.',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          suggestions: [
            'Some scenes are ready to view',
            'Retry failed generations',
            'Download successful scenes',
            'Try again for better results'
          ]
        };

      case 'network-error':
        return {
          icon: (
            <svg className="mx-auto h-16 w-16" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M24 4l2.83 2.83L24 9.66l-2.83-2.83L24 4zM12 24l2.83-2.83L9.66 24l2.83 2.83L12 24zm12 0l-2.83 2.83L38.34 24l-2.83-2.83L24 24zM24 38.34l2.83 2.83L24 43.17l-2.83-2.83L24 38.34z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          title: 'Network Connection Error',
          message: 'We\'re having trouble connecting to our servers. Please check your internet connection.',
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Disable VPN if you\'re using one',
            'Try again when connection is stable'
          ]
        };

      case 'service-unavailable':
        return {
          icon: (
            <svg className="mx-auto h-16 w-16" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M24 4l2.83 2.83L24 9.66l-2.83-2.83L24 4zM12 24l2.83-2.83L9.66 24l2.83 2.83L12 24zm12 0l-2.83 2.83L38.34 24l-2.83-2.83L24 24zM24 38.34l2.83 2.83L24 43.17l-2.83-2.83L24 38.34z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          title: 'Service Temporarily Unavailable',
          message: 'Our AI service is currently experiencing high demand. Please try again in a few minutes.',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          suggestions: [
            'Try again in 5-10 minutes',
            'Check our status page',
            'Use a different image',
            'Contact support if urgent'
          ]
        };

      case 'timeout':
        return {
          icon: (
            <svg className="mx-auto h-16 w-16" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M24 4l2.83 2.83L24 9.66l-2.83-2.83L24 4zM12 24l2.83-2.83L9.66 24l2.83 2.83L12 24zm12 0l-2.83 2.83L38.34 24l-2.83-2.83L24 24zM24 38.34l2.83 2.83L24 43.17l-2.83-2.83L24 38.34z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          title: 'Request Timeout',
          message: 'The request took too long to complete. This might be due to server load or network issues.',
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10',
          suggestions: [
            'Try again with a smaller image',
            'Check your internet speed',
            'Wait a few minutes and retry',
            'Try during off-peak hours'
          ]
        };

      default:
        return {
          icon: (
            <svg className="mx-auto h-16 w-16" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M24 4l2.83 2.83L24 9.66l-2.83-2.83L24 4zM12 24l2.83-2.83L9.66 24l2.83 2.83L12 24zm12 0l-2.83 2.83L38.34 24l-2.83-2.83L24 24zM24 38.34l2.83 2.83L24 43.17l-2.83-2.83L24 38.34z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
          title: 'Something went wrong',
          message: 'An unexpected error occurred. Please try again.',
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          suggestions: [
            'Refresh the page',
            'Try again',
            'Check your input',
            'Contact support'
          ]
        };
    }
  };

  const content = getFallbackContent();
  const canRetry = retryCount < maxRetries;

  return (
    <TransitionWrapper isVisible={true} type="fade" delay={100}>
      <HoverCard className={`bg-dark-800 rounded-lg p-8 ${className}`} hoverEffect="glow">
        <div className="text-center">
          <div className={`mb-6 ${content.color}`}>
            {content.icon}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            {content.title}
          </h2>
          
          <p className="text-dark-300 mb-6 max-w-md mx-auto">
            {content.message}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-dark-700 rounded-lg">
              <p className="text-sm text-dark-400 mb-2">Error Details:</p>
              <p className="text-sm text-red-400 font-mono">{error}</p>
            </div>
          )}

          {retryCount > 0 && (
            <div className="mb-6 p-3 bg-dark-700 rounded-lg">
              <p className="text-sm text-dark-300">
                Attempt {retryCount} of {maxRetries}
              </p>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-white">Suggestions:</h3>
            <ul className="text-sm text-dark-300 space-y-2">
              {content.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-center justify-center space-x-2">
                  <span className="text-primary-500">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {canRetry && onRetry && (
              <HoverCard hoverEffect="scale">
                <button
                  onClick={onRetry}
                  className="btn-primary"
                  disabled={retryCount >= maxRetries}
                >
                  {retryCount >= maxRetries ? 'Max Retries Reached' : 'Try Again'}
                </button>
              </HoverCard>
            )}
            
            {onBack && (
              <HoverCard hoverEffect="scale">
                <button
                  onClick={onBack}
                  className="btn-secondary"
                >
                  Go Back
                </button>
              </HoverCard>
            )}
            
            <HoverCard hoverEffect="scale">
              <a
                href="/"
                className="btn-secondary"
              >
                Start Over
              </a>
            </HoverCard>
          </div>

          {type === 'partial-failure' && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400">
                💡 Tip: You can still view and download the successfully generated scenes while retrying the failed ones.
              </p>
            </div>
          )}
        </div>
      </HoverCard>
    </TransitionWrapper>
  );
};

export default FallbackStates;
