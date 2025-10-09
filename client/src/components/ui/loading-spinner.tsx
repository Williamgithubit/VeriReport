import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner = ({ size = 'md' }: LoadingSpinnerProps) => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full ${
        size === 'sm' ? 'h-4 w-4 border-2' :
        size === 'lg' ? 'h-12 w-12 border-3' :
        'h-8 w-8 border-2'
      } border-b-2 border-gray-900`}></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
