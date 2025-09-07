import React from 'react';
import { BrandInfoForm, FormSubmission } from '../components/forms';
import { TransitionWrapper, LivePreview } from '../components/ui';

const CreatePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <TransitionWrapper isVisible={true} type="slide" delay={100}>
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-3 sm:mb-4 animate-bounce-in">
              Create Your Brand Scene
            </h1>
            <p className="text-lg sm:text-xl text-dark-300 animate-fade-in max-w-2xl mx-auto">
              Describe your product and brand values to generate AI-powered advertising scenes.
            </p>
          </div>
        </TransitionWrapper>
        
        <div className="space-y-6 sm:space-y-8">
          <TransitionWrapper isVisible={true} type="slide" delay={200}>
            <section aria-labelledby="brand-info-section">
              <h2 id="brand-info-section" className="sr-only">Brand Information</h2>
              <BrandInfoForm className="mb-0" />
            </section>
          </TransitionWrapper>
          
          <TransitionWrapper isVisible={true} type="slide" delay={300}>
            <section aria-labelledby="submission-section">
              <h2 id="submission-section" className="sr-only">Form Submission</h2>
              <FormSubmission className="mt-6 sm:mt-8" />
            </section>
          </TransitionWrapper>
        </div>
        
        {/* Live Preview Section */}
        <TransitionWrapper isVisible={true} type="slide" delay={400}>
          <section aria-labelledby="live-preview-section" className="mt-12">
            <h2 id="live-preview-section" className="sr-only">Live Preview</h2>
            <LivePreview className="" />
          </section>
        </TransitionWrapper>
      </div>
    </div>
  );
};

export default CreatePage;
