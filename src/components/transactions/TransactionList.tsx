import React from 'react';
import { Calendar } from 'lucide-react';
import { Transaction } from '../../types';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import { AmountDisplay } from '../ui/AmountDisplay';
import { TransactionItem } from './TransactionItem';

export interface TransactionListProps {
  transactionsByDate: Record<string, Transaction[]>;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  className?: string;
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) to 'Lun 27 oct. 2026'
 */
function formatDateGroup(dateString: string): string {
  try {
    const [yearStr, monthStr, dayStr] = dateString.split('T')[0].split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    const date = new Date(year, month, day);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    const weekday = new Intl.DateTimeFormat('es-PE', { weekday: 'short' }).format(date).replace('.', '');
    const monthName = new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(date).replace('.', '');

    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const lowerMonth = monthName.toLowerCase();

    return `${capitalizedWeekday} ${day} ${lowerMonth}. ${year}`;
  } catch {
    return dateString;
  }
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactionsByDate,
  onEdit,
  onDelete,
  className,
}) => {
  if (!transactionsByDate) {
    return null;
  }

  const dateKeys = Object.keys(transactionsByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const hasTransactions = dateKeys.some(
    (date) => transactionsByDate[date] && transactionsByDate[date].length > 0
  );

  // If empty, show nothing (parent handles EmptyState)
  if (!hasTransactions) {
    return null;
  }

  return (
    <div className={cn('space-y-4 font-sans', className)}>
      {dateKeys.map((dateKey) => {
        const items = transactionsByDate[dateKey];
        if (!items || items.length === 0) return null;

        const dayTotal = items.reduce(
          (sum, item) => (item.type === 'income' ? sum + item.amount : sum - item.amount),
          0
        );

        return (
          <Card key={dateKey} padding="none" className="overflow-hidden">
            {/* Date Group Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-50/90 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  {formatDateGroup(dateKey)}
                </h4>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-400">Total:</span>
                <AmountDisplay
                  amount={Math.abs(dayTotal)}
                  type={dayTotal > 0 ? 'income' : dayTotal < 0 ? 'expense' : 'neutral'}
                  size="sm"
                  showSign
                />
              </div>
            </div>

            {/* List of items for this date */}
            <div className="divide-y divide-slate-100">
              {items.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
