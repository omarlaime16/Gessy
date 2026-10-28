import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PeriodSelector } from '../components/transactions/PeriodSelector';
import { PeriodType } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency, getMonthName } from '../lib/utils';
import {
  CategoryPieChart,
  IncomeVsExpenseBarChart,
  SpendingTrendChart,
  TopCategoriesRanking,
  SmartInsightsCard,
  ExportReports,
} from '../components/analysis';

const ANALYSIS_PERIOD_OPTIONS = [
  { id: 'weekly' as PeriodType, label: 'Semanal' },
  { id: 'monthly' as PeriodType, label: 'Mensual' },
  { id: 'yearly' as PeriodType, label: 'Anual' },
];

export const AnalysisPage: React.FC = () => {
  const { categories } = useCategories();
  const { transactions } = useTransactions(categories);

  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [referenceDate, setReferenceDate] = useState<Date>(() => new Date());

  const {
    categoryBreakdown,
    totalExpenses,
    totalIncome,
    netSavings,
    savingsRate,
    dailyAverage,
    comparisonWithPrevious,
    timeSeriesData,
    monthlyComparisonData,
    smartInsights,
    periodTransactions,
  } = useAnalytics(transactions, categories, period, referenceDate);

  const hasData = periodTransactions.length > 0;

  // Formatting period label for exports and descriptions
  const getPeriodLabel = () => {
    switch (period) {
      case 'weekly':
        return 'Esta Semana';
      case 'yearly':
        return `${referenceDate.getFullYear()}`;
      case 'monthly':
      default:
        return `${getMonthName(referenceDate)} ${referenceDate.getFullYear()}`;
    }
  };

  return (
    <PageContainer
      title="Análisis Financiero"
      subtitle={`Métricas detalladas y patrones de consumo para ${getPeriodLabel()}`}
      action={
        <ExportReports
          transactions={periodTransactions}
          categoryBreakdown={categoryBreakdown}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netSavings={netSavings}
          savingsRate={savingsRate}
          dailyAverage={dailyAverage}
          periodLabel={getPeriodLabel()}
          referenceDate={referenceDate}
        />
      }
    >
      <div className="space-y-6">
        {/* Period Selector Tabs and Date Navigation */}
        <PeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          referenceDate={referenceDate}
          onReferenceDateChange={setReferenceDate}
          options={ANALYSIS_PERIOD_OPTIONS}
        />

        {!hasData ? (
          <Card className="py-12">
            <EmptyState
              icon={BarChart3}
              title="No hay transacciones en este período"
              description={`Aún no has registrado movimientos para ${getPeriodLabel()}. Cambia de fecha o agrega gastos e ingresos para visualizar tu balance y gráficos.`}
            />
          </Card>
        ) : (
          <>
            {/* Quick Metrics KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Expenses */}
              <Card className="p-4 sm:p-5 border-l-4 border-l-rose-500">
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Total Gastos
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {formatCurrency(totalExpenses)}
                </div>
                <div className="mt-2 flex items-center text-xs">
                  {comparisonWithPrevious.expenseChangePercentage !== 0 ? (
                    <span
                      className={`font-semibold mr-1.5 flex items-center ${
                        comparisonWithPrevious.isExpenseHigher
                          ? 'text-rose-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {comparisonWithPrevious.isExpenseHigher ? '▲ +' : '▼ '}
                      {comparisonWithPrevious.expenseChangePercentage.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-slate-400 mr-1">0%</span>
                  )}
                  <span className="text-slate-400">vs período ant.</span>
                </div>
              </Card>

              {/* Total Income */}
              <Card className="p-4 sm:p-5 border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Total Ingresos
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {formatCurrency(totalIncome)}
                </div>
                <div className="mt-2 flex items-center text-xs">
                  {comparisonWithPrevious.incomeChangePercentage !== 0 ? (
                    <span
                      className={`font-semibold mr-1.5 flex items-center ${
                        comparisonWithPrevious.incomeChangePercentage >= 0
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {comparisonWithPrevious.incomeChangePercentage >= 0
                        ? '▲ +'
                        : '▼ '}
                      {comparisonWithPrevious.incomeChangePercentage.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-slate-400 mr-1">0%</span>
                  )}
                  <span className="text-slate-400">vs período ant.</span>
                </div>
              </Card>

              {/* Net Savings & Savings Rate */}
              <Card className="p-4 sm:p-5 border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Balance Neto
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div
                  className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                    netSavings >= 0 ? 'text-indigo-600' : 'text-rose-600'
                  }`}
                >
                  {formatCurrency(netSavings)}
                </div>
                <div className="mt-2 flex items-center text-xs text-slate-500">
                  <span className="font-semibold text-indigo-600 mr-1">
                    {savingsRate.toFixed(1)}%
                  </span>
                  <span>tasa de ahorro</span>
                </div>
              </Card>

              {/* Daily Average Expense */}
              <Card className="p-4 sm:p-5 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Gasto Diario Promedio
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {formatCurrency(dailyAverage)}
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  ritmo de consumo actual
                </div>
              </Card>
            </div>

            {/* Middle Section: Donut Chart + Top Categories Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryPieChart
                data={categoryBreakdown}
                totalExpenses={totalExpenses}
              />
              <TopCategoriesRanking data={categoryBreakdown} />
            </div>

            {/* Trend & Historical Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IncomeVsExpenseBarChart data={monthlyComparisonData} />
              <SpendingTrendChart data={timeSeriesData} />
            </div>

            {/* Smart Automated Financial Insights */}
            <SmartInsightsCard insights={smartInsights} />
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default AnalysisPage;
