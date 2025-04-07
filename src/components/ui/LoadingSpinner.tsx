import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  className?: string;
}

/**
 * Reusable loading spinner component with customizable size and text
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'border-orange-500', 
  text, 
  className = '' 
}) => {
  // Size class mapping
  const sizeClasses = {
    sm: 'h-6 w-6 border-t-1',
    md: 'h-10 w-10 border-t-2',
    lg: 'h-16 w-16 border-t-3',
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full ${spinnerSize} ${color} mx-auto`} />
      {text && <p className="mt-3 text-zinc-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
