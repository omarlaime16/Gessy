import React, { useId } from 'react';
import { cn } from '../../utils/cn';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  size = 'md',
  className,
}) => {
  const generatedId = useId();
  const toggleId = id || generatedId;

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const isSmall = size === 'sm';

  return (
    <div
      className={cn(
        'inline-flex items-start gap-3 font-sans select-none',
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
      onClick={handleToggle}
    >
      <button
        type="button"
        role="switch"
        id={toggleId}
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out outline-none',
          'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          checked ? 'bg-indigo-600' : 'bg-slate-200',
          isSmall ? 'h-5 w-9' : 'h-6 w-11',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer active:scale-95'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
            isSmall ? 'h-4 w-4' : 'h-5 w-5',
            isSmall
              ? checked
                ? 'translate-x-4'
                : 'translate-x-0.5'
              : checked
              ? 'translate-x-5.5'
              : 'translate-x-0.5'
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && (
            <label
              htmlFor={toggleId}
              className={cn(
                'text-sm font-semibold text-slate-800 leading-tight',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-slate-500 mt-0.5 leading-normal">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
