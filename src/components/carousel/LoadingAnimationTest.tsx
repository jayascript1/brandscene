import React, { useState, useEffect } from 'react';
import { CarouselLoadingState } from './CarouselLoadingState';
import { SkeletonLoader, ProgressIndicator, TransitionWrapper, AnimatedLoader } from '../ui';

export const LoadingAnimationTest: React.FC = () => {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const demos = [
    { name: 'Initial Loading', type: 'initial' as const },
    { name: 'Scene Generation', type: 'generating' as const },
    { name: 'Loading Scenes', type: 'loading-scenes' as const },
    { name: 'Skeleton Loaders', type: 'skeleton' as const },
    { name: 'Progress Indicators', type: 'progress' as const },
    { name: 'Transitions', type: 'transitions' as const },
    { name: 'Animated Loaders', type: 'animated' as const }
  ];

  // Simulate progress for generation demo
  useEffect(() => {
    if (currentDemo === 1) { // Scene Generation
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setCurrentStep(3);
            return 100;
          }
          const newProgress = prev + Math.random() * 15;
          if (newProgress > 25 && currentStep === 0) setCurrentStep(1);
          if (newProgress > 50 && currentStep === 1) setCurrentStep(2);
          if (newProgress > 75 && currentStep === 2) setCurrentStep(3);
          return newProgress;
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
      setCurrentStep(0);
    }
  }, [currentDemo, currentStep]);

  // Auto-rotate demos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo(prev => (prev + 1) % demos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [demos.length]);

  const renderDemo = () => {
    switch (demos[currentDemo].type) {
      case 'initial':
      case 'generating':
      case 'loading-scenes':
        return (
          <CarouselLoadingState
            type={demos[currentDemo].type}
            progress={progress}
            currentStep={currentStep}
            totalSteps={4}
          />
        );
      
      case 'skeleton':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Scene Cards</h3>
              <SkeletonLoader type="scene-grid" count={4} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Text Content</h3>
              <SkeletonLoader type="text" count={3} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Buttons</h3>
              <div className="flex space-x-4">
                <SkeletonLoader type="button" />
                <SkeletonLoader type="button" />
              </div>
            </div>
          </div>
        );
      
      case 'progress':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Scene Generation Progress</h3>
              <ProgressIndicator
                progress={progress}
                totalSteps={4}
                currentStep={currentStep}
                stepLabels={[
                  'Analyzing brand',
                  'Creating concepts',
                  'Generating scenes',
                  'Finalizing'
                ]}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Simple Progress</h3>
              <ProgressIndicator
                progress={75}
                totalSteps={3}
                currentStep={1}
                showStepLabels={false}
              />
            </div>
          </div>
        );
      
      case 'transitions':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Fade Transition</h3>
              <TransitionWrapper isVisible={isVisible} type="fade">
                <div className="p-6 bg-blue-600 rounded-lg text-white">
                  This content fades in and out
                </div>
              </TransitionWrapper>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Slide Transition</h3>
              <TransitionWrapper isVisible={isVisible} type="slide-up">
                <div className="p-6 bg-green-600 rounded-lg text-white">
                  This content slides up and down
                </div>
              </TransitionWrapper>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Scale Transition</h3>
              <TransitionWrapper isVisible={isVisible} type="scale">
                <div className="p-6 bg-purple-600 rounded-lg text-white">
                  This content scales in and out
                </div>
              </TransitionWrapper>
            </div>
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Toggle Transitions
            </button>
          </div>
        );
      
      case 'animated':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Different Loader Types</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <AnimatedLoader type="spinner" size="lg" />
                  <p className="text-sm text-gray-400 mt-2">Spinner</p>
                </div>
                <div className="text-center">
                  <AnimatedLoader type="dots" size="lg" />
                  <p className="text-sm text-gray-400 mt-2">Dots</p>
                </div>
                <div className="text-center">
                  <AnimatedLoader type="pulse" size="lg" />
                  <p className="text-sm text-gray-400 mt-2">Pulse</p>
                </div>
                <div className="text-center">
                  <AnimatedLoader type="wave" size="lg" />
                  <p className="text-sm text-gray-400 mt-2">Wave</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Scene Generation Loader</h3>
              <AnimatedLoader 
                type="scene-generation" 
                size="lg" 
                text="Creating your scenes..."
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900">
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-4">Loading States & Animations Test</h2>
        <p className="text-gray-300 mb-4">
          This demonstrates all the loading states, animations, and transitions.
          <br />
          Demos auto-rotate every 5 seconds, or you can manually navigate.
        </p>
        
        {/* Demo Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {demos.map((demo, index) => (
            <button
              key={index}
              onClick={() => setCurrentDemo(index)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                index === currentDemo
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {demo.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {renderDemo()}
        </div>
      </div>
    </div>
  );
};
