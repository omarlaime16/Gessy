import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { PeriodType } from '../../types';
import { cn, getDateRange, getMonthName } from '../../lib/utils';

export interface PeriodSelectorProps {
  period: PeriodType;
  onPeriodChange: (p: PeriodType) => void;
  referenceDate: Date;
  onReferenceDateChange: (d: Date) => void;
  className?: string;
}

export interface PeriodTabOption {
  id: PeriodType;
  label: string;
}

export interface PeriodSelectorProps {
  period: PeriodType;
  onPeriodChange: (p: PeriodType) => void;
  referenceDate: Date;
  onReferenceDateChange: (d: Date) => void;
  className?: string;
  options?: PeriodTabOption[];
}

const DEFAULT_PERIOD_OPTIONS: PeriodTabOption[] = [
  { id: 'daily', label: 'Diario' },
  { id: 'weekly', label: 'Semanal' },
  { id: 'monthly', label: 'Mensual' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  period,
  onPeriodChange,
  referenceDate,
  onReferenceDateChange,
  className,
  options,
}) => {
  const activeOptions = options || DEFAULT_PERIOD_OPTIONS;

  const handlePrevious = () => {
    const newDate = new Date(referenceDate);
    switch (period) {
      case 'daily':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    onReferenceDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(referenceDate);
    switch (period) {
      case 'daily':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    onReferenceDateChange(newDate);
  };

  const handleResetToday = () => {
    onReferenceDateChange(new Date());
  };

  const formatPeriodLabel = (): string => {
    const d = new Date(referenceDate);

    if (period === 'daily') {
      const day = d.getDate();
      const monthRaw = new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(d).replace('.', '');
      const month = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    }

    if (period === 'weekly') {
      const { start, end } = getDateRange('weekly', d);
      const startDay = start.getDate();
      const endDay = end.getDate();

      const startMonthRaw = new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(start).replace('.', '');
      const endMonthRaw = new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(end).replace('.', '');

      const startMonth = startMonthRaw.charAt(0).toUpperCase() + startMonthRaw.slice(1);
      const endMonth = endMonthRaw.charAt(0).toUpperCase() + endMonthRaw.slice(1);

      if (start.getMonth() === end.getMonth()) {
        return `${startDay} - ${endDay} ${endMonth}`;
      }
      return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
    }

    if (period === 'monthly') {
      const month = getMonthName(d);
      return `${month} ${d.getFullYear()}`;
    }

    if (period === 'yearly') {
      return `${d.getFullYear()}`;
    }

    return '';
  };

  const isToday = (() => {
    const today = new Date();
    if (period === 'daily') {
      return referenceDate.toDateString() === today.toDateString();
    }
    if (period === 'monthly') {
      return (
        referenceDate.getMonth() === today.getMonth() &&
        referenceDate.getFullYear() === today.getFullYear()
      );
    }
    if (period === 'weekly') {
      const r = getDateRange('weekly', referenceDate);
      const t = getDateRange('weekly', today);
      return r.start.toDateString() === t.start.toDateString();
    }
    if (period === 'yearly') {
      return referenceDate.getFullYear() === today.getFullYear();
    }
    return false;
  })();

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 sm:p-4 font-sans space-y-3',
        className
      )}
    >
      {/* Tab selection row */}
      <div className="flex items-center justify-center p-1 bg-slate-100 rounded-xl">
        {activeOptions.map((tab) => {
          const isActive = period === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onPeriodChange(tab.id)}
              className={cn(
                'flex-1 py-1.5 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 text-center select-none outline-none',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 active:scale-[0.98]'
                  : 'text-slate-600 hover:text-slate-900 active:bg-slate-200/60'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Navigation arrows with date display */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={handlePrevious}
          aria-label="Período anterior"
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="text-sm sm:text-base font-bold text-slate-800 tracking-tight select-none">
            {formatPeriodLabel()}
          </span>

          {!isToday && (
            <button
              type="button"
              onClick={handleResetToday}
              className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full transition-colors active:scale-95 ml-1"
              title="Volver a la fecha actual"
            >
              Hoy
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Siguiente período"
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
