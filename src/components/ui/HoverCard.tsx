import React, { useState } from 'react';

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'border';
  delay?: number;
}

const HoverCard: React.FC<HoverCardProps> = ({
  children,
  className = '',
  hoverEffect = 'lift',
  delay = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getHoverClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-out';
    
    switch (hoverEffect) {
      case 'lift':
        return `${baseClasses} ${isHovered ? 'transform -translate-y-2 shadow-xl' : 'shadow-lg'}`;
      
      case 'glow':
        return `${baseClasses} ${isHovered ? 'shadow-lg shadow-primary-500/25' : 'shadow-md'}`;
      
      case 'scale':
        return `${baseClasses} ${isHovered ? 'transform scale-105' : 'transform scale-100'}`;
      
      case 'border':
        return `${baseClasses} ${isHovered ? 'border-primary-500' : 'border-transparent'}`;
      
      default:
        return baseClasses;
    }
  };

  return (
    <div
      className={`${getHoverClasses()} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default HoverCard;
