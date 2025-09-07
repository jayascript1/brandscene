import React, { useState, useEffect } from 'react';
import { performanceMonitor, memoryManager, bundleAnalyzer } from '../../utils/performance';

interface PerformanceDashboardProps {
  className?: string;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'memory' | 'optimization'>('overview');

  useEffect(() => {
    const updateMetrics = () => {
      const slowestMetrics = performanceMonitor.getSlowestMetrics(10);
      setMetrics(slowestMetrics);
      
      const memory = memoryManager.getMemoryUsage();
      setMemoryUsage(memory);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const getPerformanceScore = () => {
    const avgLoadTime = performanceMonitor.getAverageMetric('page-load');
    const avgRenderTime = performanceMonitor.getAverageMetric('component-render');
    
    let score = 100;
    
    if (avgLoadTime > 3000) score -= 30;
    else if (avgLoadTime > 1000) score -= 15;
    
    if (avgRenderTime > 100) score -= 20;
    else if (avgRenderTime > 50) score -= 10;
    
    if (memoryUsage && memoryUsage > 0.8) score -= 20;
    else if (memoryUsage && memoryUsage > 0.6) score -= 10;
    
    return Math.max(0, score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getOptimizationRecommendations = () => {
    const recommendations: string[] = [];
    const avgLoadTime = performanceMonitor.getAverageMetric('page-load');
    const avgRenderTime = performanceMonitor.getAverageMetric('component-render');
    
    if (avgLoadTime > 1000) {
      recommendations.push('Consider implementing code splitting to reduce initial bundle size');
    }
    
    if (avgRenderTime > 50) {
      recommendations.push('Optimize component rendering with React.memo and useMemo');
    }
    
    if (memoryUsage && memoryUsage > 0.7) {
      recommendations.push('Clear unused caches and optimize memory usage');
    }
    
    const imageMetrics = performanceMonitor.getMetrics('network').filter(m => 
      m.metadata?.type === 'img' || m.name.includes('image')
    );
    
    if (imageMetrics.length > 0) {
      const avgImageLoadTime = imageMetrics.reduce((sum, m) => sum + m.duration, 0) / imageMetrics.length;
      if (avgImageLoadTime > 500) {
        recommendations.push('Implement lazy loading and image optimization');
      }
    }
    
    return recommendations.length > 0 ? recommendations : ['Performance is optimal!'];
  };

  const clearMetrics = () => {
    performanceMonitor.clearMetrics();
    setMetrics([]);
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      performanceMonitor.disable();
    } else {
      performanceMonitor.enable();
    }
    setIsMonitoring(!isMonitoring);
  };

  const clearMemory = () => {
    memoryManager.clearUnusedCaches();
    memoryManager.clearImageCache();
    setMemoryUsage(memoryManager.getMemoryUsage());
  };

  return (
    <div className={`bg-dark-800 rounded-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-white mb-6">Performance Dashboard</h2>
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'metrics', label: 'Metrics', icon: '📈' },
          { id: 'memory', label: 'Memory', icon: '💾' },
          { id: 'optimization', label: 'Optimization', icon: '⚡' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Performance Score */}
          <div className="bg-dark-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Score</h3>
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(getPerformanceScore())}`}>
                {getPerformanceScore()}
              </div>
              <p className="text-dark-300">out of 100</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-dark-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {performanceMonitor.getAverageMetric('page-load').toFixed(0)}ms
              </div>
              <div className="text-dark-300 text-sm">Avg Load Time</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {performanceMonitor.getAverageMetric('component-render').toFixed(0)}ms
              </div>
              <div className="text-dark-300 text-sm">Avg Render Time</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {memoryUsage ? `${(memoryUsage * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-dark-300 text-sm">Memory Usage</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={toggleMonitoring}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
            <button
              onClick={clearMetrics}
              className="px-4 py-2 rounded-lg bg-dark-600 hover:bg-dark-500 text-white transition-colors"
            >
              Clear Metrics
            </button>
            <button
              onClick={clearMemory}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Clear Memory
            </button>
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{metric.name}</div>
                    <div className="text-dark-300 text-sm">
                      {metric.category} • {metric.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      metric.duration > 1000 ? 'text-red-400' :
                      metric.duration > 500 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {metric.duration.toFixed(0)}ms
                    </div>
                  </div>
                </div>
                {metric.metadata && (
                  <div className="mt-2 text-xs text-dark-400">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(metric.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Memory Tab */}
      {activeTab === 'memory' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white mb-4">Memory Management</h3>
          
          {/* Memory Usage */}
          <div className="bg-dark-700 rounded-lg p-6">
            <h4 className="text-white font-medium mb-4">Current Memory Usage</h4>
            {memoryUsage !== null ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark-300">Memory Usage</span>
                  <span className="text-white font-bold">{(memoryUsage * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-dark-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      memoryUsage > 0.8 ? 'bg-red-500' :
                      memoryUsage > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${memoryUsage * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-dark-300">Memory usage not available</p>
            )}
          </div>

          {/* Memory Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => memoryManager.clearUnusedCaches()}
              className="p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
            >
              <div className="text-white font-medium mb-2">Clear Unused Caches</div>
              <div className="text-dark-300 text-sm">Remove expired cache entries</div>
            </button>
            <button
              onClick={() => memoryManager.clearImageCache()}
              className="p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
            >
              <div className="text-white font-medium mb-2">Clear Image Cache</div>
              <div className="text-dark-300 text-sm">Remove cached images</div>
            </button>
          </div>
        </div>
      )}

      {/* Optimization Tab */}
      {activeTab === 'optimization' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white mb-4">Optimization Recommendations</h3>
          
          {/* Recommendations */}
          <div className="space-y-4">
            {getOptimizationRecommendations().map((recommendation, index) => (
              <div key={index} className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-blue-400 mt-1">💡</span>
                  <p className="text-white">{recommendation}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bundle Analysis */}
          <div className="bg-dark-700 rounded-lg p-6">
            <h4 className="text-white font-medium mb-4">Bundle Analysis</h4>
            <div className="space-y-2">
              <button
                onClick={() => bundleAnalyzer.trackComponentUsage('TestComponent')}
                className="w-full p-3 bg-dark-600 rounded-lg hover:bg-dark-500 transition-colors text-left"
              >
                <div className="text-white font-medium">Track Component Usage</div>
                <div className="text-dark-300 text-sm">Monitor component loading patterns</div>
              </button>
              <button
                onClick={() => bundleAnalyzer.trackFeatureUsage('TestFeature')}
                className="w-full p-3 bg-dark-600 rounded-lg hover:bg-dark-500 transition-colors text-left"
              >
                <div className="text-white font-medium">Track Feature Usage</div>
                <div className="text-dark-300 text-sm">Monitor feature usage patterns</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
