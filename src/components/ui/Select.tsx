import React, { useId } from 'react';
import { ChevronDown, AlertCircle, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  placeholder?: string;
  fullWidth?: boolean;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      icon: Icon,
      placeholder,
      fullWidth = true,
      className,
      containerClassName,
      id,
      disabled,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const hasError = Boolean(error);

    return (
      <div className={cn('flex flex-col font-sans', fullWidth ? 'w-full' : 'inline-flex', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-700 mb-1.5 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            className={cn(
              'w-full bg-white text-sm text-slate-800 appearance-none cursor-pointer',
              'rounded-xl border transition-all duration-150 py-2.5 outline-none',
              'pr-10', // space for chevron down icon
              Icon ? 'pl-10' : 'pl-3.5',
              // Borders & Focus ring
              hasError
                ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10',
              // Disabled state
              disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200 select-none',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={String(option.value)}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';
