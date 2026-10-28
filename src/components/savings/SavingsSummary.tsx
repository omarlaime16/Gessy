import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { SavingsSummary as ISavingsSummary } from '../../hooks/useSavingsGoals';
import { formatCurrency, cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

export interface SavingsSummaryProps {
  summary: ISavingsSummary;
  className?: string;
}

export const SavingsSummary: React.FC<SavingsSummaryProps> = ({
  summary,
  className,
}) => {
  const { totalSaved, totalTarget, overallPercentage, activeCount, completedCount } =
    summary;

  const isCompletedOverall = overallPercentage >= 100;
  const progressColor = isCompletedOverall
    ? 'emerald'
    : overallPercentage < 35
    ? 'amber'
    : 'indigo';

  return (
    <Card
      padding="md"
      className={cn('font-sans border-slate-200/80 shadow-sm space-y-4', className)}
    >
      {/* Top row: Metrics and Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Total Ahorrado & Meta Total */}
        <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-8">
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              Total Ahorrado
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-indigo-600 tabular-nums tracking-tight">
                {formatCurrency(totalSaved)}
              </span>
            </div>
          </div>

          <div className="sm:border-l sm:border-slate-100 sm:pl-8">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              Meta Total
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-800 tabular-nums tracking-tight">
              {formatCurrency(totalTarget)}
            </span>
          </div>
        </div>

        {/* Stats Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="info" size="md" icon={Target}>
            {activeCount} {activeCount === 1 ? 'Activa' : 'Activas'}
          </Badge>
          <Badge variant="success" size="md" icon={CheckCircle2}>
            {completedCount} {completedCount === 1 ? 'Completada' : 'Completadas'}
          </Badge>
        </div>
      </div>

      {/* Progress Bar with Percentage */}
      <div className="pt-3 border-t border-slate-100">
        <ProgressBar
          value={overallPercentage}
          color={progressColor}
          showLabel
          label="Progreso general de ahorro"
          size="md"
        />
      </div>
    </Card>
  );
};
