import React from 'react';
import { Pencil, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Budget } from '../../types';
import { DEFAULT_CATEGORIES } from '../../lib/constants';
import { cn, formatCurrency, calculatePercentage } from '../../lib/utils';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';

export interface BudgetCardProps {
  budget: Budget;
  onEdit?: (b: Budget) => void;
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

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete,
  className,
}) => {
  const category =
    budget.category ||
    DEFAULT_CATEGORIES.find((c) => c.id === budget.category_id);

  const categoryName = category?.name || 'Categoría';
  const categoryIcon = category?.icon || '📊';
  const colorKey = category?.color || 'slate';
  const categoryColorClass =
    CATEGORY_BG_COLORS[colorKey] || 'bg-slate-100 text-slate-800 border-slate-200/60';

  const spent = budget.spent ?? 0;
  const limit = budget.amount_limit;
  const remaining = limit - spent;
  const percentage = calculatePercentage(spent, limit);
  const isOverBudget = spent > limit;
  const isNearLimit =
    budget.alert_enabled && percentage >= budget.alert_threshold && !isOverBudget;

  const progressColor: 'emerald' | 'amber' | 'rose' =
    percentage < 60 ? 'emerald' : percentage <= 80 ? 'amber' : 'rose';

  const handleCardClick = () => {
    onEdit?.(budget);
  };

  return (
    <Card
      padding="md"
      hoverable
      onClick={onEdit ? handleCardClick : undefined}
      className={cn(
        'group transition-all duration-200 active:scale-[0.99] border-slate-200/80 hover:border-slate-300 font-sans',
        className
      )}
    >
      {/* Top row: Category emoji + name (left), amount spent / limit & actions (right) */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Left: Category Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center text-xl border flex-shrink-0 shadow-xs transition-transform group-hover:scale-105',
              categoryColorClass
            )}
          >
            {categoryIcon}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-base truncate tracking-tight">
              {categoryName}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isOverBudget ? (
                <Badge variant="danger" icon={AlertCircle} size="sm">
                  ¡Presupuesto excedido!
                </Badge>
              ) : isNearLimit ? (
                <Badge variant="warning" icon={AlertTriangle} size="sm">
                  Cerca del límite
                </Badge>
              ) : (
                <span className="text-xs text-slate-500 font-medium">
                  {budget.period === 'weekly' ? 'Semanal' : 'Mensual'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions and Spent / Limit display */}
        <div className="flex flex-col items-end flex-shrink-0">
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 -mr-1.5 -mt-1 mb-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(budget);
                  }}
                  title="Editar presupuesto"
                  aria-label="Editar presupuesto"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors active:scale-95"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(budget.id);
                  }}
                  title="Eliminar presupuesto"
                  aria-label="Eliminar presupuesto"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <div className="text-right">
            <span
              className={cn(
                'text-base sm:text-lg font-bold tabular-nums',
                isOverBudget ? 'text-rose-600' : 'text-slate-900'
              )}
            >
              {formatCurrency(spent)}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-400 tabular-nums">
              {' '}/ {formatCurrency(limit)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar showing percentage used */}
      <div className="my-2.5">
        <ProgressBar
          value={percentage}
          color={progressColor}
          showLabel
          label={
            isOverBudget
              ? `${Math.round(percentage)}% (Excedido)`
              : `${Math.round(percentage)}% usado`
          }
          size="md"
        />
      </div>

      {/* Bottom Row: Remaining amount (left) and period badge (right) */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-slate-500 font-medium">
            {isOverBudget ? 'Excedido por:' : 'Restante:'}
          </span>
          <span
            className={cn(
              'font-bold tabular-nums',
              isOverBudget ? 'text-rose-600' : 'text-emerald-600'
            )}
          >
            {formatCurrency(Math.abs(remaining))}
          </span>
        </div>

        <Badge variant="default" size="sm">
          {budget.period === 'weekly' ? 'Semanal' : 'Mensual'}
        </Badge>
      </div>
    </Card>
  );
};
