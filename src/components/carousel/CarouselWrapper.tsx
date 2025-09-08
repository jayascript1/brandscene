import React from 'react';
import { Simple3DCarousel } from './Simple3DCarousel';
import { useAppContext } from '../../context/AppContext';

interface CarouselWrapperProps {
  className?: string;
}

const CarouselWrapper: React.FC<CarouselWrapperProps> = ({ className = '' }) => {
  const { state } = useAppContext();
  const { generatedScenes, formData } = state;

  return (
    <Simple3DCarousel 
      scenes={generatedScenes}
      className={className}
      imageDimensions={formData.brandInfo.imageDimensions}
    />
  );
};

export default CarouselWrapper;
