import React from 'react';

interface StatusBadgeProps {
  status: 'success' | 'failure' | 'pending';
  text?: string;
  className?: string;
}

/**
 * Reusable component for displaying status badges with consistent styling
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  text, 
  className = '' 
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return 'bg-green-900/30 text-green-300';
      case 'failure':
        return 'bg-red-900/30 text-red-300';
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-300';
      default:
        return 'bg-zinc-900/30 text-zinc-300';
    }
  };

  const getStatusText = () => {
    if (text) return text;
    
    switch (status) {
      case 'success':
        return 'Success';
      case 'failure':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()} ${className}`}
    >
      {getStatusText()}
    </span>
  );
};

export default StatusBadge;
