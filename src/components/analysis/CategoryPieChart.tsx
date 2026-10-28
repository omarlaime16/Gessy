import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { CategoryBreakdownItem } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export interface CategoryPieChartProps {
  data: CategoryBreakdownItem[];
  totalExpenses: number;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CategoryBreakdownItem;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs font-sans">
        <div className="flex items-center gap-1.5 font-bold mb-1.5 text-sm">
          <span>{item.icon}</span>
          <span>{item.name}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-slate-300">
          <span>Monto:</span>
          <span className="font-semibold text-white">{formatCurrency(item.amount)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-slate-300 mt-0.5">
          <span>Porcentaje:</span>
          <span className="font-semibold text-emerald-400">{item.percentage}%</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-slate-400 mt-0.5 text-[11px]">
          <span>Transacciones:</span>
          <span>{item.count}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  data,
  totalExpenses,
  className,
}) => {
  const hasExpenses = data.length > 0 && totalExpenses > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Distribución por Categorías</CardTitle>
        <CardDescription>
          Porcentaje de tus gastos asignados a cada categoría
        </CardDescription>
      </CardHeader>

      <CardContent>
        {hasExpenses ? (
          <div>
            {/* Donut Container with centered text */}
            <div className="relative w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={2.5}
                  >
                    {data.map((entry) => (
                      <Cell
                        key={`cell-${entry.id}`}
                        fill={entry.hexColor}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center inside Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Gastado
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>

            {/* Pill tags legend below chart */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-100">
              {data.map((item) => (
                <div
                  key={item.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 border border-slate-200/70 text-slate-700 shadow-sm transition-transform hover:scale-105 select-none"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.hexColor }}
                  />
                  <span>{item.icon}</span>
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <span className="text-slate-500 font-normal">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Sin gastos en este período</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              No hay egresos registrados para mostrar la distribución porcentual.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
