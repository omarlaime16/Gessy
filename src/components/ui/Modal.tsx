import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Handle native ESC key
  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement, Event>) => {
    e.preventDefault();
    onClose();
  };

  // Close when clicking directly on the dialog backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (closeOnBackdropClick && e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className={cn(
        'm-auto p-4 bg-transparent outline-none max-w-none w-full h-full fixed inset-0 z-50',
        'backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm',
        isOpen ? 'flex items-center justify-center' : 'hidden'
      )}
    >
      <div
        className={cn(
          'w-full bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden',
          'animate-slide-up transform transition-all duration-300 font-sans',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="pr-4">
              {typeof title === 'string' ? (
                <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-snug">
                  {title}
                </h2>
              ) : (
                title
              )}
              {description && (
                <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-[calc(85vh-8rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </dialog>
  );
};
