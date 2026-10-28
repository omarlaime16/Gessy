import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  success: {
    container: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    dot: 'bg-emerald-500',
  },
  warning: {
    container: 'bg-amber-50 text-amber-700 border-amber-200/70',
    dot: 'bg-amber-500',
  },
  danger: {
    container: 'bg-rose-50 text-rose-700 border-rose-200/70',
    dot: 'bg-rose-500',
  },
  info: {
    container: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
    dot: 'bg-indigo-500',
  },
  default: {
    container: 'bg-slate-100 text-slate-700 border-slate-200/70',
    dot: 'bg-slate-400',
  },
};

const sizeStyles: Record<BadgeSize, { container: string; icon: string; dot: string }> = {
  sm: {
    container: 'px-2 py-0.5 text-[11px] gap-1',
    icon: 'w-3 h-3',
    dot: 'w-1.5 h-1.5',
  },
  md: {
    container: 'px-2.5 py-0.5 text-xs gap-1.5',
    icon: 'w-3.5 h-3.5',
    dot: 'w-2 h-2',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  icon: Icon,
  children,
  className,
  ...props
}) => {
  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border select-none font-sans',
        currentVariant.container,
        currentSize.container,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('rounded-full flex-shrink-0', currentSize.dot, currentVariant.dot)}
          aria-hidden="true"
        />
      )}
      {Icon && <Icon className={cn('flex-shrink-0', currentSize.icon)} />}
      <span>{children}</span>
    </span>
  );
};
