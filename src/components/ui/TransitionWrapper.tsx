import React, { useState, useEffect } from 'react';

interface TransitionWrapperProps {
  children: React.ReactNode;
  isVisible: boolean;
  type?: 'fade' | 'slide' | 'scale' | 'slide-up' | 'slide-down';
  duration?: number;
  delay?: number;
  className?: string;
  onTransitionEnd?: () => void;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  isVisible,
  type = 'fade',
  duration = 300,
  delay = 0,
  className = '',
  onTransitionEnd
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const getTransitionClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-out';
    
    switch (type) {
      case 'fade':
        return `${baseClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
      
      case 'slide':
        return `${baseClasses} ${isVisible ? 'translate-x-0' : 'translate-x-full'}`;
      
      case 'scale':
        return `${baseClasses} ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`;
      
      case 'slide-up':
        return `${baseClasses} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`;
      
      case 'slide-down':
        return `${baseClasses} ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`;
      
      default:
        return `${baseClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`${getTransitionClasses()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
      onTransitionEnd={onTransitionEnd}
    >
      {children}
    </div>
  );
};
