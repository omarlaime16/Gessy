import React, { useId } from 'react';
import { AlertCircle, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  prefix?: string;
  suffix?: string;
  helperText?: string;
  fullWidth?: boolean;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon: Icon,
      iconRight: IconRight,
      prefix,
      suffix,
      helperText,
      fullWidth = true,
      className,
      containerClassName,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);

    return (
      <div className={cn('flex flex-col font-sans', fullWidth ? 'w-full' : 'inline-flex', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 mb-1.5 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {/* Left Icon and/or Prefix */}
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
              <Icon className="w-4 h-4" />
            </div>
          )}

          {prefix && (
            <span
              className={cn(
                'absolute top-1/2 -translate-y-1/2 font-semibold text-xs select-none',
                hasError ? 'text-rose-500' : 'text-slate-500',
                Icon ? 'left-9' : 'left-3.5'
              )}
            >
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full bg-white text-sm text-slate-800 placeholder:text-slate-400',
              'rounded-xl border transition-all duration-150 py-2.5 outline-none',
              // Dynamic left padding
              Icon && prefix ? 'pl-16' : Icon ? 'pl-10' : prefix ? 'pl-10' : 'pl-3.5',
              // Dynamic right padding
              IconRight && suffix ? 'pr-16' : IconRight ? 'pr-10' : suffix ? 'pr-10' : 'pr-3.5',
              // Borders & Focus rings
              hasError
                ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10',
              // Disabled state
              disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200 select-none',
              className
            )}
            {...props}
          />

          {suffix && (
            <span
              className={cn(
                'absolute top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 select-none',
                IconRight ? 'right-9' : 'right-3.5'
              )}
            >
              {suffix}
            </span>
          )}

          {IconRight && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
              <IconRight className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p className="flex items-center gap-1 text-xs text-rose-500 font-medium mt-1.5 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {/* Helper text */}
        {!hasError && helperText && (
          <p className="text-xs text-slate-500 mt-1.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
