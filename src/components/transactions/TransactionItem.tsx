import React from 'react';
import { Pencil, Trash2, Repeat } from 'lucide-react';
import { Transaction } from '../../types';
import { DEFAULT_CATEGORIES } from '../../lib/constants';
import { cn, formatShortDate } from '../../lib/utils';
import { AmountDisplay } from '../ui/AmountDisplay';

export interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const CATEGORY_BG_COLORS: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-800 border-amber-200/60',
  blue: 'bg-blue-100 text-blue-800 border-blue-200/60',
  slate: 'bg-slate-100 text-slate-800 border-slate-200/60',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200/60',
  purple: 'bg-purple-100 text-purple-800 border-purple-200/60',
  pink: 'bg-pink-100 text-pink-800 border-pink-200/60',
  red: 'bg-red-100 text-red-800 border-red-200/60',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200/60',
  teal: 'bg-teal-100 text-teal-800 border-teal-200/60',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200/60',
  rose: 'bg-rose-100 text-rose-800 border-rose-200/60',
  sky: 'bg-sky-100 text-sky-800 border-sky-200/60',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200/60',
  gray: 'bg-gray-100 text-gray-800 border-gray-200/60',
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
  className,
}) => {
  const category =
    transaction.category ||
    DEFAULT_CATEGORIES.find((c) => c.id === transaction.category_id);

  const categoryName = category?.name || 'General';
  const categoryIcon = category?.icon || (transaction.type === 'income' ? '💵' : '💸');
  const colorKey = category?.color || 'slate';
  const colorClasses = CATEGORY_BG_COLORS[colorKey] || 'bg-slate-100 text-slate-800 border-slate-200/60';

  const handleClick = () => {
    onEdit?.(transaction);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(transaction);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(transaction.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit?.(transaction);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl transition-all duration-150',
        'hover:bg-slate-50/90 active:scale-[0.99] cursor-pointer font-sans select-none outline-none',
        'focus-visible:ring-2 focus-visible:ring-indigo-500/40',
        className
      )}
    >
      {/* Left: Category Icon + Details */}
      <div className="flex items-center gap-3 min-w-0 pr-3">
        <div
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 border shadow-xs transition-transform duration-150 group-hover:scale-105',
            colorClasses
          )}
        >
          <span>{categoryIcon}</span>
        </div>

        <div className="min-w-0 flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-900 truncate leading-snug">
              {categoryName}
            </span>
            {transaction.is_recurring && (
              <span
                className="inline-flex items-center justify-center p-0.5 rounded-full bg-indigo-50 text-indigo-600"
                title="Transacción recurrente"
              >
                <Repeat className="w-3 h-3" />
              </span>
            )}
          </div>

          {transaction.description && (
            <p className="text-xs text-slate-500 truncate max-w-[180px] sm:max-w-xs md:max-w-md mt-0.5">
              {transaction.description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Amount + Date + Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="flex flex-col items-end text-right">
          <AmountDisplay
            amount={transaction.amount}
            type={transaction.type}
            size="md"
            showSign
          />
          <span className="text-[11px] text-slate-400 font-medium mt-0.5">
            {formatShortDate(transaction.transaction_date)}
          </span>
        </div>

        {/* Hover / tap action buttons */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-1">
            {onEdit && (
              <button
                type="button"
                onClick={handleEditClick}
                aria-label="Editar transacción"
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors active:scale-95"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                aria-label="Eliminar transacción"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
