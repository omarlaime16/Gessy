import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Budget,
  BudgetFormData,
  BudgetStatus,
  Category,
  Transaction,
} from '../types';
import {
  calculatePercentage,
  generateId,
  getBudgetStatus,
  getDateRange,
} from '../lib/utils';
import { ALERT_THRESHOLDS } from '../lib/constants';

export interface BudgetAlert {
  budget: Budget;
  percentage: number;
  status: BudgetStatus; // 'safe' | 'warning' | 'danger'
  remaining: number;
  isOverBudget: boolean;
}

export interface UseBudgetsReturn {
  budgets: Budget[]; // enriched with category object and spent amount
  addBudget: (data: BudgetFormData) => void;
  updateBudget: (id: string, data: Partial<BudgetFormData>) => void;
  deleteBudget: (id: string) => void;
  getBudgetById: (id: string) => Budget | undefined;
  alerts: BudgetAlert[]; // budgets that exceeded their alert_threshold
  totalBudgeted: number;
  totalSpent: number;
}

const STORAGE_KEY = 'gessy_budgets';

/**
 * Safely parses a transaction date string to a Date object for range comparisons.
 * Normalizes YYYY-MM-DD inputs to local noon to avoid timezone shift pitfalls.
 */
function parseTransactionDateForRange(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);

  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0, 0);
  }

  return new Date(dateStr);
}

/**
 * Loads budgets from localStorage with schema validation
 */
function getInitialBudgets(): Budget[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is Budget =>
            item !== null &&
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            typeof item.category_id === 'string' &&
            typeof item.amount_limit === 'number'
        );
      }
    }
  } catch (error) {
    console.error('Error al cargar presupuestos de localStorage:', error);
  }
  return [];
}

/**
 * Custom hook for managing budgets with localStorage persistence and spending calculation.
 *
 * @param transactions List of transactions used to calculate spent amounts.
 * @param categories List of categories used to enrich budget items with category metadata.
 */
export function useBudgets(
  transactions: Transaction[] = [],
  categories: Category[] = []
): UseBudgetsReturn {
  const [budgets, setBudgets] = useState<Budget[]>(getInitialBudgets);

  // Persist raw budgets to localStorage (excluding redundant joined category and spent amounts)
  useEffect(() => {
    try {
      const serialized = budgets.map(({ category, spent, ...rest }) => rest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Error al guardar presupuestos en localStorage:', error);
    }
  }, [budgets]);

  // Lookup map for fast category retrieval
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const cat of categories) {
      map.set(cat.id, cat);
    }
    return map;
  }, [categories]);

  // Enrich budgets with category object and spent amount for their respective period
  const enrichedBudgets = useMemo(() => {
    const now = new Date();
    const monthlyRange = getDateRange('monthly', now);
    const weeklyRange = getDateRange('weekly', now);

    const monthlyStart = monthlyRange.start.getTime();
    const monthlyEnd = monthlyRange.end.getTime();
    const weeklyStart = weeklyRange.start.getTime();
    const weeklyEnd = weeklyRange.end.getTime();

    return budgets.map((b): Budget => {
      const isWeekly = b.period === 'weekly';
      const startTime = isWeekly ? weeklyStart : monthlyStart;
      const endTime = isWeekly ? weeklyEnd : monthlyEnd;

      // Calculate spent for this budget's category within its current period
      const spent = transactions.reduce((acc, tx) => {
        if (tx.type !== 'expense' || tx.category_id !== b.category_id) {
          return acc;
        }

        const txDate = parseTransactionDateForRange(tx.transaction_date);
        if (isNaN(txDate.getTime())) return acc;

        const time = txDate.getTime();
        if (time >= startTime && time <= endTime) {
          return acc + Math.abs(Number(tx.amount) || 0);
        }

        return acc;
      }, 0);

      const roundedSpent = Math.round(spent * 100) / 100;
      const cat = categoryMap.get(b.category_id);

      return {
        ...b,
        category: cat || b.category,
        spent: roundedSpent,
      };
    });
  }, [budgets, transactions, categoryMap]);

  // Alerts for budgets that exceeded their alert threshold
  const alerts: BudgetAlert[] = useMemo(() => {
    const list: BudgetAlert[] = [];

    for (const budget of enrichedBudgets) {
      if (!budget.alert_enabled) continue;

      const spent = budget.spent ?? 0;
      const percentage = calculatePercentage(spent, budget.amount_limit);
      const threshold = Number(budget.alert_threshold) || 0;

      if (percentage >= threshold) {
        const remaining = Math.round((budget.amount_limit - spent) * 100) / 100;
        const isOverBudget = spent > budget.amount_limit;
        const status = getBudgetStatus(percentage);

        list.push({
          budget,
          percentage,
          status,
          remaining,
          isOverBudget,
        });
      }
    }

    // Sort alerts by percentage descending (most critical first)
    return list.sort((a, b) => b.percentage - a.percentage);
  }, [enrichedBudgets]);

  // Total budgeted amount across all budgets
  const totalBudgeted = useMemo(() => {
    const total = enrichedBudgets.reduce(
      (acc, b) => acc + (Number(b.amount_limit) || 0),
      0
    );
    return Math.round(total * 100) / 100;
  }, [enrichedBudgets]);

  // Total spent amount across all budgets
  const totalSpent = useMemo(() => {
    const total = enrichedBudgets.reduce(
      (acc, b) => acc + (b.spent ?? 0),
      0
    );
    return Math.round(total * 100) / 100;
  }, [enrichedBudgets]);

  // Add a new budget
  const addBudget = useCallback((data: BudgetFormData) => {
    const newBudget: Budget = {
      id: generateId(),
      user_id: 'mock-user',
      category_id: data.category_id,
      amount_limit: Math.max(0, Number(data.amount_limit) || 0),
      period: data.period || 'monthly',
      alert_enabled: data.alert_enabled ?? true,
      alert_threshold:
        data.alert_threshold !== undefined
          ? Number(data.alert_threshold)
          : ALERT_THRESHOLDS.danger,
      created_at: new Date().toISOString(),
    };

    setBudgets((prev) => [...prev, newBudget]);
  }, []);

  // Update an existing budget
  const updateBudget = useCallback((id: string, data: Partial<BudgetFormData>) => {
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        return {
          ...b,
          ...(data.category_id !== undefined ? { category_id: data.category_id } : {}),
          ...(data.amount_limit !== undefined
            ? { amount_limit: Math.max(0, Number(data.amount_limit) || 0) }
            : {}),
          ...(data.period !== undefined ? { period: data.period } : {}),
          ...(data.alert_enabled !== undefined
            ? { alert_enabled: Boolean(data.alert_enabled) }
            : {}),
          ...(data.alert_threshold !== undefined
            ? { alert_threshold: Number(data.alert_threshold) }
            : {}),
        };
      })
    );
  }, []);

  // Delete a budget
  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Retrieve an enriched budget by ID
  const getBudgetById = useCallback(
    (id: string): Budget | undefined => {
      return enrichedBudgets.find((b) => b.id === id);
    },
    [enrichedBudgets]
  );

  return {
    budgets: enrichedBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetById,
    alerts,
    totalBudgeted,
    totalSpent,
  };
}
