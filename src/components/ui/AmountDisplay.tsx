import React from 'react';
import { cn } from '../../utils/cn';

export type AmountType = 'income' | 'expense' | 'balance' | 'neutral';
export type AmountSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AmountDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  type?: AmountType;
  size?: AmountSize;
  showSign?: boolean;
  currency?: string;
  showCurrency?: boolean;
}

const typeStyles: Record<AmountType, string> = {
  income: 'text-emerald-600',
  expense: 'text-rose-600',
  balance: 'text-indigo-600',
  neutral: 'text-slate-800',
};

const sizeStyles: Record<AmountSize, { container: string; currency: string }> = {
  xs: {
    container: 'text-xs font-semibold',
    currency: 'text-[10px] mr-1',
  },
  sm: {
    container: 'text-sm font-bold',
    currency: 'text-xs mr-1',
  },
  md: {
    container: 'text-base font-bold',
    currency: 'text-sm mr-1',
  },
  lg: {
    container: 'text-xl sm:text-2xl font-bold tracking-tight',
    currency: 'text-base sm:text-lg mr-1 font-semibold',
  },
  xl: {
    container: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
    currency: 'text-lg sm:text-xl mr-1 font-bold',
  },
};

/**
 * Formats a number to PEN currency format: "1,234.56"
 */
export function formatCurrencyAmount(amount: number): string {
  const abs = Math.abs(amount);
  return abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  type = 'balance',
  size = 'md',
  showSign,
  currency = 'S/',
  showCurrency = true,
  className,
  ...props
}) => {
  const currentSize = sizeStyles[size];
  const formattedValue = formatCurrencyAmount(amount);

  // Determine sign
  let sign = '';
  if (type === 'income') {
    sign = (showSign ?? true) ? '+' : '';
  } else if (type === 'expense') {
    sign = (showSign ?? true) ? '-' : '';
  } else if (amount < 0) {
    sign = '-';
  } else if (showSign && amount > 0) {
    sign = '+';
  }

  return (
    <span
      className={cn(
        'inline-flex items-baseline font-sans tabular-nums select-none',
        typeStyles[type],
        currentSize.container,
        className
      )}
      {...props}
    >
      {sign && <span className="mr-0.5">{sign}</span>}
      {showCurrency && (
        <span className={cn('text-current opacity-85', currentSize.currency)}>
          {currency}
        </span>
      )}
      <span>{formattedValue}</span>
    </span>
  );
};
