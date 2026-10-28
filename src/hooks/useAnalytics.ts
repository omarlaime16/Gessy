import { useMemo } from 'react';
import { Transaction, Category, PeriodType } from '../types';
import { getDateRange, formatCurrency, calculatePercentage } from '../lib/utils';

export interface CategoryBreakdownItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  hexColor: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface ComparisonWithPrevious {
  previousExpenses: number;
  previousIncome: number;
  expenseChangePercentage: number;
  incomeChangePercentage: number;
  isExpenseHigher: boolean;
}

export interface TimeSeriesPoint {
  label: string;
  income: number;
  expenses: number;
  net: number;
}

export interface MonthlyComparisonPoint {
  month: string;
  ingresos: number;
  gastos: number;
}

export type SmartInsightType = 'positive' | 'warning' | 'info' | 'tip';

export interface SmartInsight {
  id: string;
  type: SmartInsightType;
  title: string;
  description: string;
  icon: string;
}

export interface UseAnalyticsReturn {
  categoryBreakdown: CategoryBreakdownItem[];
  totalExpenses: number;
  totalIncome: number;
  netSavings: number;
  savingsRate: number;
  dailyAverage: number;
  comparisonWithPrevious: ComparisonWithPrevious;
  timeSeriesData: TimeSeriesPoint[];
  monthlyComparisonData: MonthlyComparisonPoint[];
  smartInsights: SmartInsight[];
  periodTransactions: Transaction[];
}

const CATEGORY_COLOR_HEX_MAP: Record<string, string> = {
  amber: '#f59e0b',
  blue: '#3b82f6',
  slate: '#64748b',
  yellow: '#eab308',
  purple: '#a855f7',
  pink: '#ec4899',
  red: '#ef4444',
  indigo: '#6366f1',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  emerald: '#10b981',
  gray: '#6b7280',
  violet: '#8b5cf6',
  orange: '#f97316',
  lime: '#84cc16',
};

const FALLBACK_PALETTE = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

function getCategoryHex(color: string | undefined, index: number): string {
  if (!color) return FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
  if (color.startsWith('#')) return color;
  const mapped = CATEGORY_COLOR_HEX_MAP[color.toLowerCase()];
  return mapped || FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
}

/**
 * Safely normalizes transaction date to local Date instance
 */
function parseTxDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0, 0);
  }
  return new Date(dateStr);
}

/**
 * Calculates previous period reference date of identical duration
 */
function getPreviousReferenceDate(period: PeriodType, refDate: Date): Date {
  const d = new Date(refDate);
  switch (period) {
    case 'daily':
      d.setDate(d.getDate() - 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() - 7);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() - 1);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() - 1);
      break;
  }
  return d;
}

/**
 * Custom analytics hook for Gessy personal finance
 */
export function useAnalytics(
  transactions: Transaction[],
  categories: Category[],
  period: PeriodType,
  referenceDate: Date
): UseAnalyticsReturn {
  return useMemo(() => {
    // 1. Current and previous date ranges
    const { start: currentStart, end: currentEnd } = getDateRange(period, referenceDate);
    const prevRefDate = getPreviousReferenceDate(period, referenceDate);
    const { start: prevStart, end: prevEnd } = getDateRange(period, prevRefDate);

    const startTime = currentStart.getTime();
    const endTime = currentEnd.getTime();
    const prevStartTime = prevStart.getTime();
    const prevEndTime = prevEnd.getTime();

    // Fast category lookup map
    const categoryMap = new Map<string, Category>();
    for (const cat of categories) {
      categoryMap.set(cat.id, cat);
    }

    // Filter current and previous period transactions
    const periodTransactions: Transaction[] = [];
    const previousTransactions: Transaction[] = [];

    for (const tx of transactions) {
      const parsed = parseTxDate(tx.transaction_date);
      const time = parsed.getTime();
      if (isNaN(time)) continue;

      if (time >= startTime && time <= endTime) {
        periodTransactions.push({
          ...tx,
          category: tx.category || categoryMap.get(tx.category_id),
        });
      } else if (time >= prevStartTime && time <= prevEndTime) {
        previousTransactions.push(tx);
      }
    }

    // 2. Financial totals
    let totalExpenses = 0;
    let totalIncome = 0;

    for (const tx of periodTransactions) {
      const amt = Math.abs(Number(tx.amount) || 0);
      if (tx.type === 'expense') {
        totalExpenses += amt;
      } else if (tx.type === 'income') {
        totalIncome += amt;
      }
    }

    totalExpenses = Math.round(totalExpenses * 100) / 100;
    totalIncome = Math.round(totalIncome * 100) / 100;
    const netSavings = Math.round((totalIncome - totalExpenses) * 100) / 100;

    // Savings rate (0 - 100%)
    let savingsRate = 0;
    if (totalIncome > 0) {
      const rawRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
      savingsRate = Math.max(0, Math.min(100, Math.round(rawRate * 10) / 10));
    }

    // Daily average
    let daysInPeriod = 1;
    if (period === 'daily') {
      daysInPeriod = 1;
    } else if (period === 'weekly') {
      daysInPeriod = 7;
    } else if (period === 'monthly') {
      daysInPeriod = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth() + 1,
        0
      ).getDate();
    } else if (period === 'yearly') {
      const year = referenceDate.getFullYear();
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      daysInPeriod = isLeap ? 366 : 365;
    }

    const dailyAverage =
      daysInPeriod > 0 ? Math.round((totalExpenses / daysInPeriod) * 100) / 100 : 0;

    // 3. Comparison with previous period
    let previousExpenses = 0;
    let previousIncome = 0;

    for (const tx of previousTransactions) {
      const amt = Math.abs(Number(tx.amount) || 0);
      if (tx.type === 'expense') {
        previousExpenses += amt;
      } else if (tx.type === 'income') {
        previousIncome += amt;
      }
    }

    previousExpenses = Math.round(previousExpenses * 100) / 100;
    previousIncome = Math.round(previousIncome * 100) / 100;

    let expenseChangePercentage = 0;
    if (previousExpenses === 0) {
      expenseChangePercentage = totalExpenses > 0 ? 100 : 0;
    } else {
      expenseChangePercentage =
        Math.round(((totalExpenses - previousExpenses) / previousExpenses) * 1000) / 10;
    }

    let incomeChangePercentage = 0;
    if (previousIncome === 0) {
      incomeChangePercentage = totalIncome > 0 ? 100 : 0;
    } else {
      incomeChangePercentage =
        Math.round(((totalIncome - previousIncome) / previousIncome) * 1000) / 10;
    }

    const isExpenseHigher = totalExpenses > previousExpenses;

    const comparisonWithPrevious: ComparisonWithPrevious = {
      previousExpenses,
      previousIncome,
      expenseChangePercentage,
      incomeChangePercentage,
      isExpenseHigher,
    };

    // 4. Category breakdown (expenses only)
    const categoryExpenseMap = new Map<
      string,
      { amount: number; count: number; category?: Category }
    >();

    for (const tx of periodTransactions) {
      if (tx.type !== 'expense') continue;
      const amt = Math.abs(Number(tx.amount) || 0);
      const catId = tx.category_id || 'unknown';
      const existing = categoryExpenseMap.get(catId) || {
        amount: 0,
        count: 0,
        category: tx.category || categoryMap.get(catId),
      };

      categoryExpenseMap.set(catId, {
        amount: existing.amount + amt,
        count: existing.count + 1,
        category: existing.category || tx.category || categoryMap.get(catId),
      });
    }

    const categoryBreakdown: CategoryBreakdownItem[] = Array.from(
      categoryExpenseMap.entries()
    )
      .map(([catId, val], index) => {
        const cat = val.category;
        const name = cat?.name || 'Otros';
        const icon = cat?.icon || '📦';
        const color = cat?.color || 'gray';
        const hexColor = getCategoryHex(cat?.color, index);
        const amount = Math.round(val.amount * 100) / 100;
        const percentage = calculatePercentage(amount, totalExpenses);

        return {
          id: catId,
          name,
          icon,
          color,
          hexColor,
          amount,
          percentage,
          count: val.count,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // 5. Time series data for trends
    const timeSeriesData: TimeSeriesPoint[] = [];

    if (period === 'weekly') {
      const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      for (let i = 0; i < 7; i++) {
        const d = new Date(currentStart);
        d.setDate(d.getDate() + i);
        const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
        const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();

        let dayIncome = 0;
        let dayExpenses = 0;

        for (const tx of periodTransactions) {
          const t = parseTxDate(tx.transaction_date).getTime();
          if (t >= dStart && t <= dEnd) {
            const amt = Math.abs(Number(tx.amount) || 0);
            if (tx.type === 'income') dayIncome += amt;
            else if (tx.type === 'expense') dayExpenses += amt;
          }
        }

        timeSeriesData.push({
          label: `${dayNames[i]} ${d.getDate()}`,
          income: Math.round(dayIncome * 100) / 100,
          expenses: Math.round(dayExpenses * 100) / 100,
          net: Math.round((dayIncome - dayExpenses) * 100) / 100,
        });
      }
    } else if (period === 'monthly') {
      const year = currentStart.getFullYear();
      const month = currentStart.getMonth();
      const totalDays = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= totalDays; day++) {
        const dStart = new Date(year, month, day, 0, 0, 0, 0).getTime();
        const dEnd = new Date(year, month, day, 23, 59, 59, 999).getTime();

        let dayIncome = 0;
        let dayExpenses = 0;

        for (const tx of periodTransactions) {
          const t = parseTxDate(tx.transaction_date).getTime();
          if (t >= dStart && t <= dEnd) {
            const amt = Math.abs(Number(tx.amount) || 0);
            if (tx.type === 'income') dayIncome += amt;
            else if (tx.type === 'expense') dayExpenses += amt;
          }
        }

        timeSeriesData.push({
          label: String(day),
          income: Math.round(dayIncome * 100) / 100,
          expenses: Math.round(dayExpenses * 100) / 100,
          net: Math.round((dayIncome - dayExpenses) * 100) / 100,
        });
      }
    } else if (period === 'yearly') {
      const year = currentStart.getFullYear();
      const monthLabels = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic',
      ];

      for (let m = 0; m < 12; m++) {
        const mStart = new Date(year, m, 1, 0, 0, 0, 0).getTime();
        const mEnd = new Date(year, m + 1, 0, 23, 59, 59, 999).getTime();

        let mIncome = 0;
        let mExpenses = 0;

        for (const tx of periodTransactions) {
          const t = parseTxDate(tx.transaction_date).getTime();
          if (t >= mStart && t <= mEnd) {
            const amt = Math.abs(Number(tx.amount) || 0);
            if (tx.type === 'income') mIncome += amt;
            else if (tx.type === 'expense') mExpenses += amt;
          }
        }

        timeSeriesData.push({
          label: monthLabels[m],
          income: Math.round(mIncome * 100) / 100,
          expenses: Math.round(mExpenses * 100) / 100,
          net: Math.round((mIncome - mExpenses) * 100) / 100,
        });
      }
    } else {
      // Daily period fallback: 7 days window ending on referenceDate
      for (let i = 6; i >= 0; i--) {
        const d = new Date(referenceDate);
        d.setDate(d.getDate() - i);
        const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
        const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();

        let dayIncome = 0;
        let dayExpenses = 0;

        for (const tx of transactions) {
          const t = parseTxDate(tx.transaction_date).getTime();
          if (t >= dStart && t <= dEnd) {
            const amt = Math.abs(Number(tx.amount) || 0);
            if (tx.type === 'income') dayIncome += amt;
            else if (tx.type === 'expense') dayExpenses += amt;
          }
        }

        timeSeriesData.push({
          label: `${d.getDate()}/${d.getMonth() + 1}`,
          income: Math.round(dayIncome * 100) / 100,
          expenses: Math.round(dayExpenses * 100) / 100,
          net: Math.round((dayIncome - dayExpenses) * 100) / 100,
        });
      }
    }

    // 6. Monthly comparison data (last 6 months relative to referenceDate)
    const monthlyComparisonData: MonthlyComparisonPoint[] = [];
    const baseYear = referenceDate.getFullYear();
    const baseMonth = referenceDate.getMonth();

    for (let offset = 5; offset >= 0; offset--) {
      const targetDate = new Date(baseYear, baseMonth - offset, 1);
      const mStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1, 0, 0, 0, 0).getTime();
      const mEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

      const rawMonth = new Intl.DateTimeFormat('es-PE', { month: 'short' })
        .format(targetDate)
        .replace('.', '');
      const monthLabel = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

      let mIncome = 0;
      let mExpenses = 0;

      for (const tx of transactions) {
        const t = parseTxDate(tx.transaction_date).getTime();
        if (t >= mStart && t <= mEnd) {
          const amt = Math.abs(Number(tx.amount) || 0);
          if (tx.type === 'income') mIncome += amt;
          else if (tx.type === 'expense') mExpenses += amt;
        }
      }

      monthlyComparisonData.push({
        month: monthLabel,
        ingresos: Math.round(mIncome * 100) / 100,
        gastos: Math.round(mExpenses * 100) / 100,
      });
    }

    // 7. Smart actionable insights
    const smartInsights: SmartInsight[] = [];

    // Insight 1: Savings Rate / Net balance
    if (savingsRate >= 20) {
      smartInsights.push({
        id: 'savings-healthy',
        type: 'positive',
        title: 'Tasa de ahorro saludable',
        description: `Estás ahorrando el ${savingsRate}% de tus ingresos en este período. ¡Superas la regla del 20% recomendada!`,
        icon: 'TrendingUp',
      });
    } else if (totalIncome > 0 && totalExpenses > totalIncome) {
      smartInsights.push({
        id: 'negative-savings',
        type: 'warning',
        title: 'Gastos superan tus ingresos',
        description: `Tus gastos exceden tus ingresos en ${formatCurrency(totalExpenses - totalIncome)}. Revisa tus categorías principales para equilibrar tu presupuesto.`,
        icon: 'AlertTriangle',
      });
    } else if (savingsRate > 0 && savingsRate < 20) {
      smartInsights.push({
        id: 'savings-low',
        type: 'warning',
        title: 'Tasa de ahorro por debajo del 20%',
        description: `Tu tasa de ahorro es del ${savingsRate}%. Intenta reducir pequeños gastos prescindibles para alcanzar la meta ideal del 20%.`,
        icon: 'AlertCircle',
      });
    } else if (totalIncome === 0 && totalExpenses > 0) {
      smartInsights.push({
        id: 'no-income',
        type: 'info',
        title: 'Sin ingresos registrados',
        description: `Registraste ${formatCurrency(totalExpenses)} en gastos pero aún no has registrado ingresos en este período.`,
        icon: 'Info',
      });
    } else {
      smartInsights.push({
        id: 'balanced-start',
        type: 'info',
        title: 'Sin movimientos registrados',
        description: 'Registra tus primeros ingresos y gastos para activar las alertas y recomendaciones automáticas.',
        icon: 'Info',
      });
    }

    // Insight 2: Category expense concentration
    if (categoryBreakdown.length > 0) {
      const topCategory = categoryBreakdown[0];
      if (topCategory.percentage >= 40) {
        smartInsights.push({
          id: 'category-concentration',
          type: 'warning',
          title: `Alta concentración en ${topCategory.name}`,
          description: `El ${topCategory.percentage}% de tus gastos (${formatCurrency(topCategory.amount)}) se concentra en ${topCategory.name}. Te sugerimos fijar un presupuesto límite.`,
          icon: 'PieChart',
        });
      } else {
        smartInsights.push({
          id: 'top-category',
          type: 'info',
          title: `Mayor gasto: ${topCategory.name}`,
          description: `Tu principal egreso es ${topCategory.name} con ${formatCurrency(topCategory.amount)} (${topCategory.percentage}% del total).`,
          icon: 'PieChart',
        });
      }
    }

    // Insight 3: Comparison with previous period
    if (previousExpenses > 0) {
      const diff = expenseChangePercentage;
      if (diff > 10) {
        smartInsights.push({
          id: 'expense-increase',
          type: 'warning',
          title: `Gastaste un ${Math.abs(diff)}% más`,
          description: `Tus gastos aumentaron en ${formatCurrency(totalExpenses - previousExpenses)} frente al período anterior.`,
          icon: 'TrendingDown',
        });
      } else if (diff < -5) {
        smartInsights.push({
          id: 'expense-reduction',
          type: 'positive',
          title: `¡Redujiste gastos en un ${Math.abs(diff)}%!`,
          description: `Gastaste menos que en el período anterior (${formatCurrency(previousExpenses)} vs ${formatCurrency(totalExpenses)}). ¡Gran disciplina financiera!`,
          icon: 'ShieldCheck',
        });
      } else {
        smartInsights.push({
          id: 'expense-stable',
          type: 'info',
          title: 'Gastos estables',
          description: `Tus gastos se mantienen estables con una variación de ${diff >= 0 ? '+' : ''}${diff}% respecto al período anterior.`,
          icon: 'Activity',
        });
      }
    }

    // Insight 4: Financial tip
    if (dailyAverage > 0) {
      smartInsights.push({
        id: 'daily-tip',
        type: 'tip',
        title: `Promedio diario: ${formatCurrency(dailyAverage)}`,
        description: `Mantener un gasto diario controlado cercano a ${formatCurrency(dailyAverage)} te asegura llegar a fin de mes con holgura.`,
        icon: 'Lightbulb',
      });
    } else {
      smartInsights.push({
        id: 'general-rule',
        type: 'tip',
        title: 'Aplica la regla 50/30/20',
        description: 'Destina 50% de tus ingresos a necesidades básicas, 30% a estilo de vida y 20% al ahorro o inversión.',
        icon: 'Sparkles',
      });
    }

    return {
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
    };
  }, [transactions, categories, period, referenceDate]);
}
