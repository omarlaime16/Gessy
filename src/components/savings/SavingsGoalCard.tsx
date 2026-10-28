import React from 'react';
import { Pencil, Trash2, Plus, Calendar, CheckCircle2 } from 'lucide-react';
import { SavingsGoal } from '../../types';
import { calculatePercentage, cn, formatCurrency, formatDate } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar, ProgressBarColor } from '../ui/ProgressBar';
import { Button } from '../ui/Button';

export interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onAddFunds: (goal: SavingsGoal) => void;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  onAddFunds,
  onEdit,
  onDelete,
  className,
}) => {
  const percentage = calculatePercentage(goal.current_amount, goal.target_amount);
  const isCompleted = goal.status === 'completed' || goal.current_amount >= goal.target_amount;
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);

  // Dynamic progress bar color: emerald if completed, else indigo or amber
  const progressColor: ProgressBarColor = isCompleted
    ? 'emerald'
    : percentage < 35
    ? 'amber'
    : 'indigo';

  return (
    <Card
      padding="md"
      className={cn(
        'group flex flex-col justify-between transition-all duration-200 border-slate-200/80 hover:border-slate-300 font-sans',
        isCompleted && 'border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/20',
        className
      )}
    >
      <div>
        {/* Top Header: Icon + Title + Actions */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border flex-shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105',
                isCompleted
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-indigo-50 border-indigo-100 text-indigo-700'
              )}
            >
              {goal.icon || '🎯'}
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-base truncate tracking-tight leading-snug">
                {goal.name}
              </h3>
              <div className="mt-1">
                {isCompleted ? (
                  <Badge variant="success" size="sm">
                    ¡Completada! 🎉
                  </Badge>
                ) : (
                  <Badge variant="info" size="sm">
                    En progreso
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Edit / Delete Action Buttons */}
          <div className="flex items-center gap-1 opacity-90 sm:opacity-75 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(goal);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Editar meta"
              aria-label="Editar meta"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(goal.id);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Eliminar meta"
              aria-label="Eliminar meta"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Amount Display */}
        <div className="space-y-1 mb-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(goal.current_amount)}
            </span>
            <span className="text-xs font-bold text-slate-600 tabular-nums">
              {Math.round(percentage)}%
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">
            de {formatCurrency(goal.target_amount)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <ProgressBar
            value={percentage}
            color={progressColor}
            size="md"
          />
        </div>

        {/* Extra info: Remaining and Deadline */}
        <div className="flex items-center justify-between text-xs pt-1 pb-4 border-b border-slate-100">
          <div className="min-w-0">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ¡Meta alcanzada!
              </span>
            ) : (
              <span className="text-slate-500">
                Faltan <strong className="text-slate-700">{formatCurrency(remaining)}</strong>
              </span>
            )}
          </div>

          <div
            className="flex items-center gap-1 text-slate-500 flex-shrink-0"
            title={goal.deadline ? `Fecha límite: ${formatDate(goal.deadline)}` : 'Sin fecha límite'}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">
              {goal.deadline ? formatDate(goal.deadline) : 'Sin fecha'}
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA: + Aportar */}
      <div className="pt-3">
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          fullWidth
          onClick={() => onAddFunds(goal)}
          className={cn(
            isCompleted &&
              'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 focus-visible:ring-emerald-500'
          )}
        >
          {isCompleted ? '+ Aportar más' : '+ Aportar'}
        </Button>
      </div>
    </Card>
  );
};
