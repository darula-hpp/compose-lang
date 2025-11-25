import React from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class, e.g., 'text-primary-500'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-primary-500' }) => {
  const spinnerSize = clsx({
    'w-4 h-4': size === 'sm',
    'w-6 h-6': size === 'md',
    'w-8 h-8': size === 'lg',
  });

  const spinnerBorder = clsx({
    'border-2': size === 'sm',
    'border-3': size === 'md',
    'border-4': size === 'lg',
  });

  return (
    <div
      className={clsx(
        'inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
        spinnerSize,
        spinnerBorder,
        color
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};

export default LoadingSpinner;
