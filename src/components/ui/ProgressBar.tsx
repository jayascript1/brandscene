import React from 'react';

interface ProgressBarProps {
  progress: number;
  total?: number;
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'gradient' | 'striped';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total = 100,
  showPercentage = true,
  showLabel = false,
  label,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const percentage = Math.min(Math.max((progress / total) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    default: 'bg-primary-500',
    gradient: 'bg-gradient-to-r from-primary-500 to-primary-600',
    striped: 'bg-primary-500 bg-stripes'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-dark-300">{label}</span>
          {showPercentage && (
            <span className="text-sm text-dark-300">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-dark-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${variantClasses[variant]} transition-all duration-500 ease-out ${sizeClasses[size]}`}
          style={{ width: `${percentage}%` }}
        >
          {variant === 'striped' && (
            <div className="w-full h-full bg-stripes animate-pulse" />
          )}
        </div>
      </div>
      
      {!showLabel && showPercentage && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-dark-400">Progress</span>
          <span className="text-xs text-dark-400">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
