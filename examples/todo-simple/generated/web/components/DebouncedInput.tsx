// This component is not strictly needed as react-debounce-input is used directly in app/page.tsx
// However, if more complex styling or logic were needed, it would be here.
// For now, it's just a placeholder to show where it *could* be.
import React from 'react';
import { DebounceInput } from 'react-debounce-input';
import { cn } from '@/lib/utils';

interface DebouncedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  minLength?: number;
  debounceTimeout?: number;
}

export const CustomDebouncedInput = React.forwardRef<HTMLInputElement, DebouncedInputProps>(
  ({ className, minLength = 1, debounceTimeout = 300, ...props }, ref) => {
    return (
      <DebounceInput
        minLength={minLength}
        debounceTimeout={debounceTimeout}
        element="input"
        className={cn(
          'w-full px-4 py-2 border rounded-md shadow-sm',
          'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700',
          'text-gray-900 dark:text-gray-100',
          'focus:ring-primary-500 focus:border-primary-500',
          className
        )}
        inputRef={ref}
        {...props}
      />
    );
  }
);

CustomDebouncedInput.displayName = 'CustomDebouncedInput';
