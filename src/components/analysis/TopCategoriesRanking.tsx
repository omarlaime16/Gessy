import React from 'react';
import { Trophy, HelpCircle } from 'lucide-react';
import { CategoryBreakdownItem } from '../../hooks/useAnalytics';
import { formatCurrency, cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export interface TopCategoriesRankingProps {
  data: CategoryBreakdownItem[];
  className?: string;
}

export const TopCategoriesRanking: React.FC<TopCategoriesRankingProps> = ({
  data,
  className,
}) => {
  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-100 text-amber-900 border-amber-300 shadow-amber-100';
      case 2:
        return 'bg-slate-200 text-slate-800 border-slate-300 shadow-slate-100';
      case 3:
        return 'bg-orange-100 text-orange-900 border-orange-300 shadow-orange-100';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getRankLabel = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇 1';
      case 2:
        return '🥈 2';
      case 3:
        return '🥉 3';
      default:
        return `#${rank}`;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Ranking de Categorías</span>
            </CardTitle>
            <CardDescription>
              Categorías con mayor volumen de gasto en el período
            </CardDescription>
          </div>
          {data.length > 0 && (
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              {data.length} {data.length === 1 ? 'categoría' : 'categorías'}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-3">
            {data.map((cat, index) => {
              const rank = index + 1;
              return (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100/90 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Podium badge */}
                      <span
                        className={cn(
                          'w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-xs font-bold border shadow-xs select-none',
                          getRankBadgeStyle(rank)
                        )}
                      >
                        {getRankLabel(rank)}
                      </span>

                      {/* Icon */}
                      <span className="text-xl flex-shrink-0">{cat.icon}</span>

                      {/* Name and count */}
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">
                          {cat.name}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {cat.count} {cat.count === 1 ? 'gasto' : 'gastos'}
                        </span>
                      </div>
                    </div>

                    {/* Amount & percentage */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-extrabold text-slate-900 block tracking-tight">
                        {formatCurrency(cat.amount)}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <ProgressBar
                    value={cat.percentage}
                    size="sm"
                    className="mt-1"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
              <HelpCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Sin datos de gastos</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Al registrar gastos, verás aquí el podio de tus categorías más frecuentes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
