import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { MonthlyComparisonPoint } from '../../hooks/useAnalytics';
import { formatCurrency } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';

export interface IncomeVsExpenseBarChartProps {
  data: MonthlyComparisonPoint[];
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
  }>;
  label?: string;
}

const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length > 0) {
    const ingresos = payload.find((p) => p.dataKey === 'ingresos')?.value || 0;
    const gastos = payload.find((p) => p.dataKey === 'gastos')?.value || 0;
    const balance = Math.round((ingresos - gastos) * 100) / 100;

    return (
      <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs font-sans">
        <p className="font-bold text-slate-300 mb-1.5">{label}</p>
        <div className="flex items-center justify-between gap-4 text-emerald-400">
          <span>Ingresos:</span>
          <span className="font-semibold">{formatCurrency(ingresos)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-rose-400 mt-0.5">
          <span>Gastos:</span>
          <span className="font-semibold">{formatCurrency(gastos)}</span>
        </div>
        <div className="border-t border-slate-800 mt-1.5 pt-1.5 flex items-center justify-between gap-4 text-slate-300">
          <span>Balance:</span>
          <span
            className={`font-semibold ${
              balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {balance >= 0 ? '+' : ''}
            {formatCurrency(balance)}
          </span>
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

export const IncomeVsExpenseBarChart: React.FC<IncomeVsExpenseBarChartProps> = ({
  data,
  className,
}) => {
  const hasData = data.some((d) => d.ingresos > 0 || d.gastos > 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Ingresos vs Gastos</CardTitle>
        <CardDescription>
          Comparativa mensual de tus flujos financieros en los últimos 6 meses
        </CardDescription>
      </CardHeader>

      <CardContent>
        {hasData ? (
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
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
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-slate-600 select-none">
                      {value === 'ingresos' ? 'Ingresos' : 'Gastos'}
                    </span>
                  )}
                  wrapperStyle={{ paddingBottom: '16px' }}
                />
                <Bar
                  dataKey="ingresos"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="gastos"
                  fill="#f43f5e"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Sin datos históricos suficientes</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Registra transacciones para comparar tus ingresos y gastos de los últimos meses.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
