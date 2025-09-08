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
    if (formData.brandInfo && !isRetrying) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
      
      try {
        await retryGeneration(formData.brandInfo);
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
            <div className="bg-dark-800 rounded-lg p-6 sm:p-8">
              <CarouselWrapper className="w-full h-96 sm:h-[500px] lg:h-[600px]" />
            </div>
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
