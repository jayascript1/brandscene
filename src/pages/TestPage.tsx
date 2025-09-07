import React, { useState } from 'react';
import { ThreeSceneTest } from '../components/carousel/ThreeSceneTest';
import { CarouselTest } from '../components/carousel/CarouselTest';
import { EnhancedCarouselTest } from '../components/carousel/EnhancedCarouselTest';
import { LoadingAnimationTest } from '../components/carousel/LoadingAnimationTest';
import { ExportTest } from '../components/carousel/ExportTest';
import { AccessibilityTest, ErrorTesting, PerformanceDashboard } from '../components/ui';

const TestPage: React.FC = () => {
  const [activeTest, setActiveTest] = useState<'basic' | 'carousel' | 'enhanced' | 'loading' | 'export' | 'accessibility' | 'error' | 'performance'>('performance');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Test Navigation */}
      <div className="p-4 text-white border-b border-gray-700">
        <h1 className="text-3xl font-bold mb-4">Three.js & Carousel Tests</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTest('basic')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTest === 'basic'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Basic Three.js Test
          </button>
          <button
            onClick={() => setActiveTest('carousel')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTest === 'carousel'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Carousel Mechanics Test
          </button>
          <button
            onClick={() => setActiveTest('enhanced')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTest === 'enhanced'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Enhanced Scene Cards Test
          </button>
          <button
            onClick={() => setActiveTest('loading')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTest === 'loading'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Loading & Animations Test
          </button>
          <button
            onClick={() => setActiveTest('export')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTest === 'export'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Export Functionality Test
          </button>
          <button
            onClick={() => setActiveTest('accessibility')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTest === 'accessibility'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Accessibility Test
          </button>
          <button
            onClick={() => setActiveTest('error')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTest === 'error'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Error Handling Test
          </button>
          <button
            onClick={() => setActiveTest('performance')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTest === 'performance'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Performance Test
          </button>
        </div>
      </div>

      {/* Test Content */}
      <div className="flex-1 p-4">
        {activeTest === 'basic' && <ThreeSceneTest />}
        {activeTest === 'carousel' && <CarouselTest />}
        {activeTest === 'enhanced' && <EnhancedCarouselTest />}
        {activeTest === 'loading' && <LoadingAnimationTest />}
        {activeTest === 'export' && <ExportTest />}
        {activeTest === 'accessibility' && <AccessibilityTest />}
        {activeTest === 'error' && <ErrorTesting />}
        {activeTest === 'performance' && <PerformanceDashboard />}
      </div>
    </div>
  );
};

export default TestPage;
