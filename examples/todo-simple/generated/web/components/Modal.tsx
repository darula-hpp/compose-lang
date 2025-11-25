'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useOverlay, useModal, usePreventScroll, useOverlayTrigger } from 'react-aria';
import { OverlayContainer } from '@react-aria/overlays';
import { XMarkIcon } from './Icons';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { modalProps } = useModal();
  const { overlayProps } = useOverlay({ onClose, isOpen, isDismissable: true }, ref);
  usePreventScroll({ isDisabled: !isOpen });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  return (
    <OverlayContainer>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm"
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div
          {...overlayProps}
          {...modalProps}
          ref={ref}
          className={cn(
            'relative bg-white dark:bg-gray-800 rounded-lg shadow-card-hover max-w-lg w-full p-6',
            'transform transition-all duration-300 ease-out scale-100 opacity-100', // For initial animation
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-200 dark:border-gray-700">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="text-gray-700 dark:text-gray-300">{children}</div>
        </div>
      </div>
    </OverlayContainer>
  );
}
