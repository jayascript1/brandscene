import React, { useState } from 'react';
import { FallbackStates } from './index';
import { captureError, captureGenerationError, captureNetworkError, errorMonitor } from '../../utils/errorMonitoring';

interface ErrorTestingProps {
  className?: string;
}

const ErrorTesting: React.FC<ErrorTestingProps> = ({ className = '' }) => {
  const [activeTest, setActiveTest] = useState<string>('');
  const [testResults, setTestResults] = useState<Array<{ type: string; success: boolean; message: string }>>([]);

  const testScenarios = [
    {
      id: 'network-error',
      name: 'Network Error',
      description: 'Simulate network connectivity issues',
      category: 'Network'
    },
    {
      id: 'api-error',
      name: 'API Error',
      description: 'Simulate API service failures',
      category: 'API'
    },
    {
      id: 'generation-error',
      name: 'Generation Error',
      description: 'Simulate AI generation failures',
      category: 'Generation'
    },
    {
      id: 'validation-error',
      name: 'Validation Error',
      description: 'Simulate form validation errors',
      category: 'Validation'
    },
    {
      id: 'timeout-error',
      name: 'Timeout Error',
      description: 'Simulate request timeouts',
      category: 'Performance'
    },
    {
      id: 'partial-failure',
      name: 'Partial Failure',
      description: 'Simulate partial generation success',
      category: 'Generation'
    },
    {
      id: 'react-error',
      name: 'React Error',
      description: 'Simulate React component errors',
      category: 'UI'
    },
    {
      id: 'performance-error',
      name: 'Performance Error',
      description: 'Simulate performance issues',
      category: 'Performance'
    }
  ];

  const runTest = async (testId: string) => {
    setActiveTest(testId);
    const results = [...testResults];

    try {
      switch (testId) {
        case 'network-error':
          // Simulate network error
          captureNetworkError(
            new Error('Network request failed'),
            'https://api.example.com/generate',
            'POST',
            500
          );
          results.push({ type: testId, success: true, message: 'Network error captured successfully' });
          break;

        case 'api-error':
          // Simulate API error
          captureError(
            new Error('API service unavailable'),
            'api-service',
            { endpoint: '/generate', method: 'POST' },
            'high'
          );
          results.push({ type: testId, success: true, message: 'API error captured successfully' });
          break;

        case 'generation-error':
          // Simulate generation error
          captureGenerationError(
            new Error('AI generation failed'),
            2,
            { prompt: 'test prompt', model: 'gpt-4' }
          );
          results.push({ type: testId, success: true, message: 'Generation error captured successfully' });
          break;

        case 'validation-error':
          // Simulate validation error
          captureError(
            new Error('Invalid input provided'),
            'form-validation',
            { field: 'image', value: 'invalid-file' },
            'medium'
          );
          results.push({ type: testId, success: true, message: 'Validation error captured successfully' });
          break;

        case 'timeout-error':
          // Simulate timeout
          captureError(
            new Error('Request timed out after 30 seconds'),
            'api-timeout',
            { timeout: 30000, endpoint: '/generate' },
            'medium'
          );
          results.push({ type: testId, success: true, message: 'Timeout error captured successfully' });
          break;

        case 'partial-failure':
          // Simulate partial failure
          captureGenerationError(
            new Error('Partial generation failure'),
            3,
            { completed: 2, failed: 2, total: 4 }
          );
          results.push({ type: testId, success: true, message: 'Partial failure captured successfully' });
          break;

        case 'react-error':
          // Simulate React error
          captureError(
            new Error('React component render error'),
            'react-component',
            { component: 'SceneCarousel', props: {} },
            'high'
          );
          results.push({ type: testId, success: true, message: 'React error captured successfully' });
          break;

        case 'performance-error':
          // Simulate performance issue
          errorMonitor.capturePerformanceMetric('scene-generation', 15000, {
            sceneCount: 4,
            imageSize: '2MB'
          });
          results.push({ type: testId, success: true, message: 'Performance error captured successfully' });
          break;

        default:
          results.push({ type: testId, success: false, message: 'Unknown test scenario' });
      }
    } catch (error) {
      results.push({ type: testId, success: false, message: `Test failed: ${error}` });
    }

    setTestResults(results);
    setActiveTest('');
  };

  const clearResults = () => {
    setTestResults([]);
    errorMonitor.clearErrors();
  };

  const getAnalytics = () => {
    return errorMonitor.getAnalytics();
  };



  return (
    <div className={`bg-dark-800 rounded-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-white mb-6">Error Handling Testing</h2>
      
      {/* Test Scenarios */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Test Scenarios</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testScenarios.map((scenario) => (
            <div key={scenario.id} className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium">{scenario.name}</h4>
                <span className="text-xs bg-dark-600 text-dark-300 px-2 py-1 rounded">
                  {scenario.category}
                </span>
              </div>
              <p className="text-dark-300 text-sm mb-3">{scenario.description}</p>
              <button
                onClick={() => runTest(scenario.id)}
                disabled={activeTest === scenario.id}
                className="w-full btn-primary text-sm py-2"
              >
                {activeTest === scenario.id ? 'Running...' : 'Run Test'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Test Results</h3>
            <button
              onClick={clearResults}
              className="btn-secondary text-sm py-2 px-4"
            >
              Clear Results
            </button>
          </div>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                    {result.success ? '✓' : '✗'}
                  </span>
                  <span className="text-white font-medium">{result.type}</span>
                  <span className="text-dark-300 text-sm">{result.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Analytics */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Error Analytics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            const analytics = getAnalytics();
            return [
              { label: 'Total Errors', value: analytics.totalErrors },
              { label: 'Error Rate', value: `${analytics.errorRate.toFixed(2)}/min` },
              { label: 'Recent Errors', value: analytics.recentErrors.length },
              { label: 'Categories', value: Object.keys(analytics.errorsByCategory).length }
            ];
          })().map((stat, index) => (
            <div key={index} className="bg-dark-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-dark-300 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Categories Breakdown */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Error Categories</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(() => {
            const analytics = getAnalytics();
            return Object.entries(analytics.errorsByCategory).map(([category, count]) => (
              <div key={category} className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium capitalize">{category}</span>
                  <span className="text-primary-500 font-bold">{count}</span>
                </div>
                <div className="mt-2 bg-dark-600 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(count / analytics.totalErrors) * 100}%` }}
                  />
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Fallback States Preview */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Fallback States Preview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {['generation-failed', 'partial-failure', 'network-error', 'timeout'].map((type) => (
            <div key={type} className="bg-dark-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 capitalize">
                {type.replace('-', ' ')} State
              </h4>
              <div className="scale-75 origin-top-left">
                <FallbackStates
                  type={type as any}
                  error="This is a test error message for demonstration purposes."
                  retryCount={1}
                  maxRetries={3}
                  onRetry={() => console.log('Retry clicked')}
                  onBack={() => console.log('Back clicked')}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Errors */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Errors</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {(() => {
            const analytics = getAnalytics();
            return analytics.recentErrors.slice(0, 10).map((error, index) => (
              <div key={index} className="bg-dark-700 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">
                      {error.error instanceof Error ? error.error.message : error.error}
                    </div>
                    <div className="text-dark-300 text-xs mt-1">
                      {error.context} • {error.severity} • {error.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ml-2 ${
                    error.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    error.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    error.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {error.severity}
                  </span>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

export default ErrorTesting;
