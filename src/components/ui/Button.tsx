import React from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm shadow-indigo-100 border border-transparent focus-visible:ring-indigo-500',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm focus-visible:ring-slate-300 active:bg-slate-100',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 shadow-sm shadow-rose-100 border border-transparent focus-visible:ring-rose-500',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent focus-visible:ring-slate-300 active:bg-slate-200/70',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs h-8 px-3 rounded-lg gap-1.5 font-medium',
  md: 'text-sm h-10 px-4 rounded-xl gap-2 font-medium',
  lg: 'text-base h-12 px-5 rounded-xl gap-2.5 font-semibold',
};

const iconSizes: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconRight: IconRight,
      loading = false,
      loadingText,
      fullWidth = false,
      disabled = false,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center select-none font-sans outline-none',
          'transition-all duration-150 ease-in-out',
          'focus-visible:ring-2 focus-visible:ring-offset-2',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          isDisabled
            ? 'opacity-60 cursor-not-allowed pointer-events-none shadow-none'
            : 'active:scale-[0.97] cursor-pointer',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className={cn('animate-spin flex-shrink-0', iconSizes[size])} />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {Icon && <Icon className={cn('flex-shrink-0', iconSizes[size])} />}
            {children && <span>{children}</span>}
            {IconRight && <IconRight className={cn('flex-shrink-0', iconSizes[size])} />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
