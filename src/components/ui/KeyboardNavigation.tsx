import React, { useEffect, useRef, ReactNode } from 'react';

interface KeyboardNavigationProps {
  children: ReactNode;
  className?: string;
  onNavigate?: (direction: 'prev' | 'next') => void;
  onSelect?: () => void;
  onEscape?: () => void;
  items?: any[];
  currentIndex?: number;
  setCurrentIndex?: (index: number) => void;
}

const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  className = '',
  onNavigate,
  onSelect,
  onEscape,
  items = [],
  currentIndex = 0,
  setCurrentIndex
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (onNavigate) {
            onNavigate('prev');
          } else if (setCurrentIndex && items.length > 0) {
            const newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            setCurrentIndex(newIndex);
          }
          break;

        case 'ArrowRight':
          event.preventDefault();
          if (onNavigate) {
            onNavigate('next');
          } else if (setCurrentIndex && items.length > 0) {
            const newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            setCurrentIndex(newIndex);
          }
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (onSelect) {
            onSelect();
          }
          break;

        case 'Escape':
          event.preventDefault();
          if (onEscape) {
            onEscape();
          }
          break;

        case 'Home':
          event.preventDefault();
          if (setCurrentIndex && items.length > 0) {
            setCurrentIndex(0);
          }
          break;

        case 'End':
          event.preventDefault();
          if (setCurrentIndex && items.length > 0) {
            setCurrentIndex(items.length - 1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNavigate, onSelect, onEscape, items, currentIndex, setCurrentIndex]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="region"
      aria-label="Interactive carousel navigation"
      tabIndex={0}
    >
      {children}
    </div>
  );
};

export default KeyboardNavigation;
