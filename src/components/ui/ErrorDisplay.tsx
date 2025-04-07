import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Reusable component for displaying error messages with an optional retry button
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  message, 
  onRetry, 
  className = '' 
}) => {
  return (
    <div className={`bg-red-900/30 border border-red-800 p-4 rounded-lg ${className}`}>
      <p className="text-red-300 mb-2">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="mt-2 text-white bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg text-sm"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
