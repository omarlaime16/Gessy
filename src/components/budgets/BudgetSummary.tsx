import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { formatCurrency, calculatePercentage, cn } from '../../lib/utils';

export interface BudgetSummaryProps {
  totalBudgeted: number;
  totalSpent: number;
  className?: string;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  totalBudgeted,
  totalSpent,
  className,
}) => {
  const percentage = calculatePercentage(totalSpent, totalBudgeted);
  const remaining = totalBudgeted - totalSpent;
  const isOverBudget = totalSpent > totalBudgeted;

  const spentColor = isOverBudget ? 'text-rose-600' : 'text-emerald-600';
  const remainingColor = remaining >= 0 ? 'text-emerald-600' : 'text-rose-600';

  const progressColor: 'emerald' | 'amber' | 'rose' =
    percentage < 60 ? 'emerald' : percentage <= 80 ? 'amber' : 'rose';

  return (
    <Card padding="md" className={cn('font-sans border-slate-200/80 shadow-sm', className)}>
      {/* 3 Stats Side by Side */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center sm:text-left">
        {/* Presupuestado */}
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Presupuestado
          </span>
          <span className="text-sm sm:text-lg md:text-xl font-bold text-indigo-600 tabular-nums">
            {formatCurrency(totalBudgeted)}
          </span>
        </div>

        {/* Gastado */}
        <div className="flex flex-col border-l border-slate-100 pl-2 sm:pl-4">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Gastado
          </span>
          <span className={cn('text-sm sm:text-lg md:text-xl font-bold tabular-nums', spentColor)}>
            {formatCurrency(totalSpent)}
          </span>
        </div>

        {/* Disponible */}
        <div className="flex flex-col border-l border-slate-100 pl-2 sm:pl-4">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {isOverBudget ? 'Excedido' : 'Disponible'}
          </span>
          <span className={cn('text-sm sm:text-lg md:text-xl font-bold tabular-nums', remainingColor)}>
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <ProgressBar
          value={percentage}
          color={progressColor}
          showLabel
          label={
            isOverBudget
              ? `Límite superado (${Math.round(percentage)}%)`
              : 'Progreso del presupuesto general'
          }
          size="md"
        />
      </div>
    </Card>
  );
};
