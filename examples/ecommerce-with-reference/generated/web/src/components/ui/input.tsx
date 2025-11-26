import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={twMerge(
        'w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-DEFAULT focus:border-primary-DEFAULT transition-colors duration-200',
        className
      )}
      {...props}
    />
  );
};

export default Input;
