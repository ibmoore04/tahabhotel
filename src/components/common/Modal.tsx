// ==============================================================================
// TAHAB HOTEL & SUITES LTD — ACCESSIBLE MODAL & CONFIRM DIALOG
// ==============================================================================

import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  className?: string;
  mobileBottomSheet?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
  className,
  mobileBottomSheet = true,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'relative w-full bg-white dark:bg-charcoal-900 shadow-2xl border border-stone-200 dark:border-stone-800 z-10 max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden',
          mobileBottomSheet
            ? 'sm:rounded-sm rounded-t-2xl sm:rounded-t-sm'
            : 'rounded-sm',
          mobileBottomSheet
            ? 'translate-y-0 sm:translate-y-0'
            : '',
          maxWidths[maxWidth],
          className
        )}
      >
        {/* Mobile Drag Handle */}
        {mobileBottomSheet && (
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-stone-300" />
          </div>
        )}

        {/* Modal Header */}
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-200 dark:border-stone-800 bg-warm-50/50 dark:bg-charcoal-850">
            <h3 className="font-serif text-base sm:text-lg font-bold text-emerald-950 dark:text-warm-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-1 text-stone-400 hover:text-stone-700 dark:hover:text-warm-100 transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-4">
        {isDangerous && (
          <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-stone-900 dark:text-warm-50 font-serif">
            {title}
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-200 dark:border-stone-800">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={isDangerous ? 'danger' : 'gold'}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
