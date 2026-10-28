import React from 'react';
import { cn } from '../../utils/cn';

export type ProgressBarColor = 'emerald' | 'amber' | 'rose' | 'indigo';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  value: number; // 0 to 100
  color?: ProgressBarColor;
  size?: ProgressBarSize;
  showLabel?: boolean;
  label?: string;
  showValue?: boolean;
  className?: string;
}

const colorStyles: Record<ProgressBarColor, string> = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  indigo: 'bg-indigo-600',
};

const sizeStyles: Record<ProgressBarSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color,
  size = 'md',
  showLabel = false,
  label,
  showValue = false,
  className,
}) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));

  // Determine dynamic color if not explicitly provided
  const resolvedColor: ProgressBarColor =
    color ||
    (clampedValue < 60
      ? 'emerald'
      : clampedValue <= 80
      ? 'amber'
      : 'rose');

  return (
    <div className={cn('w-full font-sans', className)}>
      {(showLabel || label || showValue) && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5 select-none">
          {label && <span>{label}</span>}
          {!label && <span />}
          {(showValue || showLabel) && (
            <span className="text-slate-500 tabular-nums">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          'w-full bg-slate-100 rounded-full overflow-hidden',
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progreso'}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorStyles[resolvedColor]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
