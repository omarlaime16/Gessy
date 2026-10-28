import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { TimeSeriesPoint } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export interface SpendingTrendChartProps {
  data: TimeSeriesPoint[];
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}

const CustomAreaTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length > 0) {
    const expenses = payload[0].value || 0;

    return (
      <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs font-sans">
        <p className="font-semibold text-slate-400 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="text-slate-300">Gasto:</span>
          <span className="font-bold text-white text-sm">{formatCurrency(expenses)}</span>
        </div>
      </div>
    );
  }
  return null;
};

const formatYAxisTick = (val: number): string => {
  if (val >= 1000) {
    const kVal = (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1);
    return `S/ ${kVal}k`;
  }
  return `S/ ${val}`;
};

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  data,
  className,
}) => {
  const hasExpenses = data.some((d) => d.expenses > 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tendencia de Gastos</CardTitle>
        <CardDescription>
          Evolución temporal de tus egresos a lo largo del período seleccionado
        </CardDescription>
      </CardHeader>

      <CardContent>
        {hasExpenses ? (
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxisTick}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendingGradient)"
                  activeDot={{
                    r: 6,
                    fill: '#6366f1',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Sin gastos para graficar</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              No hay movimientos de egreso en las fechas seleccionadas para mostrar una curva de tendencia.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
