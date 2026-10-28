import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Budget } from '../../types';
import { DEFAULT_CATEGORIES } from '../../lib/constants';
import { cn, formatCurrency } from '../../lib/utils';

export interface BudgetAlertItem {
  budget: Budget;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
  remaining: number;
  isOverBudget: boolean;
}

export interface BudgetAlertBannerProps {
  alerts: BudgetAlertItem[];
  className?: string;
}

export const BudgetAlertBanner: React.FC<BudgetAlertBannerProps> = ({
  alerts,
  className,
}) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const overBudgetAlerts = alerts.filter((a) => a.isOverBudget);
  const hasOverBudget = overBudgetAlerts.length > 0;
  const overCount = overBudgetAlerts.length;
  const totalCount = alerts.length;

  const headerMessage = hasOverBudget
    ? `¡Cuidado! Has excedido ${overCount} ${overCount === 1 ? 'presupuesto' : 'presupuestos'}`
    : `Estás cerca del límite en ${totalCount} ${totalCount === 1 ? 'categoría' : 'categorías'}`;

  // Sort alerts so that over-budget items appear first, followed by highest percentage
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.isOverBudget && !b.isOverBudget) return -1;
    if (!a.isOverBudget && b.isOverBudget) return 1;
    return b.percentage - a.percentage;
  });

  return (
    <div
      role="alert"
      className={cn(
        'rounded-2xl border p-4 sm:p-5 transition-all duration-200 font-sans shadow-xs',
        hasOverBudget
          ? 'bg-rose-50/90 border-rose-200/80 text-rose-950'
          : 'bg-amber-50/90 border-amber-200/80 text-amber-950',
        className
      )}
    >
      {/* Banner Header */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs',
            hasOverBudget
              ? 'bg-rose-100 text-rose-600'
              : 'bg-amber-100 text-amber-600'
          )}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm sm:text-base font-bold tracking-tight leading-snug">
            {headerMessage}
          </h4>
          <p
            className={cn(
              'text-xs mt-0.5 leading-normal',
              hasOverBudget ? 'text-rose-700' : 'text-amber-700'
            )}
          >
            {hasOverBudget
              ? 'Revisa tus gastos para evitar mayores desviaciones en tu plan financiero.'
              : 'Te recomendamos moderar tus gastos en estas áreas antes de fin de mes.'}
          </p>
        </div>
      </div>

      {/* Affected categories list */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sortedAlerts.map((item) => {
          const category =
            item.budget.category ||
            DEFAULT_CATEGORIES.find((c) => c.id === item.budget.category_id);

          const categoryName = category?.name || 'Categoría';
          const categoryIcon = category?.icon || '📊';

          return (
            <div
              key={item.budget.id}
              className={cn(
                'flex items-center justify-between p-2.5 rounded-xl border text-xs shadow-2xs backdrop-blur-xs transition-colors',
                item.isOverBudget
                  ? 'bg-white/95 border-rose-200/70 text-slate-800'
                  : 'bg-white/95 border-amber-200/70 text-slate-800'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg flex-shrink-0 select-none">
                  {categoryIcon}
                </span>
                <span className="font-bold truncate text-slate-900">
                  {categoryName}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span
                  className={cn(
                    'font-bold px-1.5 py-0.5 rounded-md text-[11px] tabular-nums',
                    item.isOverBudget
                      ? 'bg-rose-100 text-rose-700 font-extrabold'
                      : 'bg-amber-100 text-amber-700 font-bold'
                  )}
                >
                  {Math.round(item.percentage)}%
                </span>
                <span
                  className={cn(
                    'font-semibold tabular-nums text-right',
                    item.isOverBudget ? 'text-rose-600' : 'text-slate-600'
                  )}
                >
                  {item.isOverBudget
                    ? `+${formatCurrency(Math.abs(item.remaining))}`
                    : `Restan ${formatCurrency(item.remaining)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
