import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAIGeneration } from '../hooks/useAIGeneration';
import { LoadingSpinner, TransitionWrapper, HoverCard, FallbackStates } from '../components/ui';
import { CarouselWrapper } from '../components/carousel';
import { captureGenerationError } from '../utils/errorMonitoring';

const ResultsPage: React.FC = () => {
  const { state } = useAppContext();
  const { retryGeneration } = useAIGeneration();
  const { generationRequest, generatedScenes, error, formData } = state;
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const isGenerating = generationRequest?.status === 'pending' || generationRequest?.status === 'processing';
  const hasResults = generatedScenes.length > 0;
  const hasError = error || generationRequest?.status === 'failed';
  const hasPartialResults = generatedScenes.length > 0 && generatedScenes.length < 4;

  const handleRetry = async () => {
    if (formData.brandInfo && formData.image && !isRetrying) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
      
      try {
        await retryGeneration(formData.brandInfo, formData.image);
        // Reset retry count on successful retry
        setRetryCount(0);
      } catch (error) {
        console.error('Retry failed:', error);
        captureGenerationError(
          error instanceof Error ? error : new Error(String(error)),
          generatedScenes.length + 1,
          { retryCount: retryCount + 1, formData: formData.brandInfo }
        );
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const handleBackToCreate = () => {
    window.location.href = '/';
  };

  const getErrorType = () => {
    if (hasPartialResults) {
      return 'partial-failure';
    }
    
    const errorMessage = error || generationRequest?.errorMessage || '';
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('network') || lowerError.includes('connection') || lowerError.includes('fetch')) {
      return 'network-error';
    }
    if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
      return 'timeout';
    }
    if (lowerError.includes('service') || lowerError.includes('unavailable') || lowerError.includes('overloaded')) {
      return 'service-unavailable';
    }
    if (lowerError.includes('generation') || lowerError.includes('ai') || lowerError.includes('replicate')) {
      return 'generation-failed';
    }
    
    return 'generation-failed';
  };

  if (isGenerating) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto text-center">
          <TransitionWrapper isVisible={true} type="fade" delay={100}>
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-3 sm:mb-4 animate-bounce-in">
              Generating Your Scenes
            </h1>
          </TransitionWrapper>
          
          <TransitionWrapper isVisible={true} type="fade" delay={200}>
            <p className="text-lg sm:text-xl text-dark-300 mb-6 sm:mb-8 animate-fade-in">
              Creating 4 unique brand scenes with AI...
            </p>
          </TransitionWrapper>
          
          <TransitionWrapper isVisible={true} type="scale" delay={300}>
            <LoadingSpinner 
              message={`Generating scene ${Math.floor((generationRequest?.progress || 0) / 25) + 1} of 4`}
              progress={generationRequest?.progress}
              className="bg-dark-800 rounded-lg"
              variant="pulse"
            />
          </TransitionWrapper>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <FallbackStates
            type={getErrorType()}
            error={error || generationRequest?.errorMessage}
            retryCount={retryCount}
            maxRetries={3}
            onRetry={handleRetry}
            onBack={handleBackToCreate}
            className="mb-8"
          />
          
          {hasPartialResults && (
            <TransitionWrapper isVisible={true} type="slide" delay={200}>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Partial Results Available
                </h2>
                <p className="text-dark-300 mb-6">
                  {generatedScenes.length} of 4 scenes were generated successfully.
                </p>
                <CarouselWrapper className="mb-6" />
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <HoverCard hoverEffect="scale">
                    <button
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className="btn-primary"
                    >
                      {isRetrying ? 'Retrying...' : 'Retry Failed Scenes'}
                    </button>
                  </HoverCard>
                  <HoverCard hoverEffect="scale">
                    <button className="btn-secondary">
                      Download Available Scenes
                    </button>
                  </HoverCard>
                </div>
              </div>
            </TransitionWrapper>
          )}
        </div>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <TransitionWrapper isVisible={true} type="slide" delay={100}>
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-3 sm:mb-4 animate-bounce-in">
                Generated Scenes
              </h1>
              <p className="text-lg sm:text-xl text-dark-300 animate-fade-in">
                Your AI-generated brand scenes are ready to explore
              </p>
            </div>
          </TransitionWrapper>
          
          <TransitionWrapper isVisible={true} type="scale" delay={200}>
            <HoverCard className="bg-dark-800 rounded-lg p-6 sm:p-8" hoverEffect="glow">
              <div className="text-center">
                <div className="text-dark-400 mb-4 animate-float">
                  <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40h10v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714m0 0a10 10 0 012.828-2.828M24 32a10 10 0 012.828-2.828" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 animate-fade-in">
                  3D Carousel Coming Soon
                </h2>
                <p className="text-dark-300 mb-6 animate-fade-in">
                  Your generated scenes will be displayed here in an interactive 3D carousel
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-md mx-auto">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i}
                      className="w-full h-24 sm:h-32 bg-dark-700 rounded-lg flex items-center justify-center animate-pulse-slow"
                      style={{ animationDelay: `${i * 0.1}s` }}
                      aria-label={`Placeholder for scene ${i}`}
                    >
                      <span className="text-dark-400 text-sm sm:text-base">Scene {i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </HoverCard>
          </TransitionWrapper>
          
          <TransitionWrapper isVisible={true} type="slide" delay={300}>
            <div className="text-center mt-6 sm:mt-8">
              <HoverCard hoverEffect="scale">
                <a 
                  href="/" 
                  className="btn-secondary"
                  aria-label="Create a new brand scene"
                >
                  Create New Scene
                </a>
              </HoverCard>
            </div>
          </TransitionWrapper>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <TransitionWrapper isVisible={true} type="slide" delay={100}>
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-3 sm:mb-4 animate-bounce-in">
              Your Generated Scenes
            </h1>
            <p className="text-lg sm:text-xl text-dark-300 animate-fade-in">
              {generatedScenes.length} scenes created successfully
            </p>
          </div>
        </TransitionWrapper>
        
        <TransitionWrapper isVisible={true} type="scale" delay={200}>
          <section aria-labelledby="carousel-section">
            <h2 id="carousel-section" className="sr-only">Scene Carousel</h2>
            <CarouselWrapper className="mb-6 sm:mb-8" />
          </section>
        </TransitionWrapper>
        
        <TransitionWrapper isVisible={true} type="slide" delay={300}>
          <div className="text-center">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <HoverCard hoverEffect="scale" className="inline-block">
                <a 
                  href="/" 
                  className="btn-secondary w-full sm:w-auto"
                  aria-label="Create a new brand scene"
                >
                  Create New Scene
                </a>
              </HoverCard>
              <HoverCard hoverEffect="glow" className="inline-block">
                <button 
                  className="btn-primary w-full sm:w-auto"
                  aria-label="Download all generated scenes"
                >
                  Download All Scenes
                </button>
              </HoverCard>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    </div>
  );
};

export default ResultsPage;
