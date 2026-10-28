import { useState, useEffect, useCallback, useMemo } from 'react';
import { Category, PeriodType, Transaction, TransactionFormData } from '../types';
import { getDateRange, generateId } from '../lib/utils';

export interface TransactionSummary {
  income: number;
  expenses: number;
  balance: number;
}

export interface UseTransactionsReturn {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  period: PeriodType;
  setPeriod: (p: PeriodType) => void;
  referenceDate: Date;
  setReferenceDate: (d: Date) => void;
  addTransaction: (data: TransactionFormData) => Transaction;
  updateTransaction: (id: string, data: Partial<TransactionFormData>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByPeriod: (period: PeriodType, refDate?: Date) => Transaction[];
  summary: TransactionSummary;
  transactionsByDate: Record<string, Transaction[]>;
}

const STORAGE_KEY = 'gessy_transactions';

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
 * Loads transactions from localStorage with schema validation
 */
function getInitialTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is Transaction =>
            item !== null &&
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            typeof item.amount === 'number'
        );
      }
    }
  } catch (error) {
    console.error('Error al cargar transacciones de localStorage:', error);
  }
  return [];
}

/**
 * Custom hook for transaction management with localStorage persistence.
 * Accepts categories to enrich transactions with category details.
 */
export function useTransactions(
  categories: Category[] = [],
  initialPeriod: PeriodType = 'monthly',
  initialReferenceDate: Date = new Date()
): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>(getInitialTransactions);
  const [period, setPeriod] = useState<PeriodType>(initialPeriod);
  const [referenceDate, setReferenceDate] = useState<Date>(initialReferenceDate);

  // Persist raw transactions to localStorage (excluding redundant joined category object)
  useEffect(() => {
    try {
      const serialized = transactions.map(({ category, ...rest }) => rest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Error al guardar transacciones en localStorage:', error);
    }
  }, [transactions]);

  // Efficient map for category lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const cat of categories) {
      map.set(cat.id, cat);
    }
    return map;
  }, [categories]);

  // Enrich transactions with matching category and sort newest first
  const enrichedTransactions = useMemo(() => {
    return transactions
      .map((tx): Transaction => {
        const cat = categoryMap.get(tx.category_id);
        return {
          ...tx,
          category: cat || tx.category,
        };
      })
      .sort((a, b) => {
        const timeA = parseTransactionDateForRange(a.transaction_date).getTime();
        const timeB = parseTransactionDateForRange(b.transaction_date).getTime();
        if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
          return timeB - timeA;
        }
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [transactions, categoryMap]);

  // Helper function to filter a transaction list by period and referenceDate
  const filterTransactions = useCallback(
    (txList: Transaction[], periodType: PeriodType, refDate: Date): Transaction[] => {
      const { start, end } = getDateRange(periodType, refDate);
      const startTime = start.getTime();
      const endTime = end.getTime();

      return txList.filter((tx) => {
        const txDate = parseTransactionDateForRange(tx.transaction_date);
        if (isNaN(txDate.getTime())) return false;
        const time = txDate.getTime();
        return time >= startTime && time <= endTime;
      });
    },
    []
  );

  // Transactions filtered by active period & referenceDate
  const filteredTransactions = useMemo(() => {
    return filterTransactions(enrichedTransactions, period, referenceDate);
  }, [enrichedTransactions, period, referenceDate, filterTransactions]);

  // Retrieve transactions for any custom period and referenceDate
  const getTransactionsByPeriod = useCallback(
    (p: PeriodType, refDate?: Date): Transaction[] => {
      return filterTransactions(enrichedTransactions, p, refDate ?? referenceDate);
    },
    [enrichedTransactions, referenceDate, filterTransactions]
  );

  // Financial summary (income, expenses, balance)
  const summary: TransactionSummary = useMemo(() => {
    let income = 0;
    let expenses = 0;

    for (const tx of filteredTransactions) {
      const amt = Math.abs(Number(tx.amount) || 0);
      if (tx.type === 'income') {
        income += amt;
      } else if (tx.type === 'expense') {
        expenses += amt;
      }
    }

    const roundedIncome = Math.round(income * 100) / 100;
    const roundedExpenses = Math.round(expenses * 100) / 100;
    const balance = Math.round((roundedIncome - roundedExpenses) * 100) / 100;

    return {
      income: roundedIncome,
      expenses: roundedExpenses,
      balance,
    };
  }, [filteredTransactions]);

  // Group filtered transactions by date string (newest date first)
  const transactionsByDate = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};

    for (const tx of filteredTransactions) {
      if (!tx.transaction_date) continue;
      const dateKey = tx.transaction_date.includes('T')
        ? tx.transaction_date.split('T')[0]
        : tx.transaction_date;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(tx);
    }

    // Sort date keys descending (newest first)
    const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    const sortedGrouped: Record<string, Transaction[]> = {};
    for (const key of sortedKeys) {
      sortedGrouped[key] = grouped[key];
    }

    return sortedGrouped;
  }, [filteredTransactions]);

  // Add a new transaction
  const addTransaction = useCallback(
    (data: TransactionFormData): Transaction => {
      const newTx: Transaction = {
        id: generateId(),
        user_id: 'mock-user',
        category_id: data.category_id,
        amount: Math.abs(Number(data.amount) || 0),
        type: data.type,
        description: data.description ? data.description.trim() : '',
        transaction_date: data.transaction_date,
        is_recurring: Boolean(data.is_recurring),
        recurring_frequency: data.is_recurring ? (data.recurring_frequency ?? null) : null,
        created_at: new Date().toISOString(),
      };

      setTransactions((prev) => [newTx, ...prev]);

      const cat = categoryMap.get(newTx.category_id);
      return {
        ...newTx,
        category: cat,
      };
    },
    [categoryMap]
  );

  // Update existing transaction
  const updateTransaction = useCallback(
    (id: string, data: Partial<TransactionFormData>) => {
      setTransactions((prev) =>
        prev.map((tx) => {
          if (tx.id === id) {
            const updatedAmount =
              data.amount !== undefined ? Math.abs(Number(data.amount) || 0) : tx.amount;
            const updatedRecurring =
              data.is_recurring !== undefined ? Boolean(data.is_recurring) : tx.is_recurring;
            const updatedFrequency =
              data.recurring_frequency !== undefined
                ? (updatedRecurring ? data.recurring_frequency : null)
                : tx.recurring_frequency;

            return {
              ...tx,
              ...data,
              amount: updatedAmount,
              description:
                data.description !== undefined ? data.description.trim() : tx.description,
              is_recurring: updatedRecurring,
              recurring_frequency: updatedFrequency,
            };
          }
          return tx;
        })
      );
    },
    []
  );

  // Delete transaction
  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  return {
    transactions: enrichedTransactions,
    filteredTransactions,
    period,
    setPeriod,
    referenceDate,
    setReferenceDate,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByPeriod,
    summary,
    transactionsByDate,
  };
}
