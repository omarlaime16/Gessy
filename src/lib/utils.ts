import { PeriodType, BudgetStatus } from '../types';
import { ALERT_THRESHOLDS, CURRENCY } from './constants';

/**
 * Formats a numeric amount to Peruvian Soles (PEN) string format: S/ 1,234.56
 */
export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formattedNumber = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}${CURRENCY.symbol} ${formattedNumber}`;
}

/**
 * Formats a Date or date string to a Spanish readable date string
 * Example: 27 oct. 2026
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat(CURRENCY.locale, defaultOptions).format(d);
}

/**
 * Formats a Date or date string to short DD/MM format
 * Example: 27/10
 */
export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

/**
 * Returns capitalized Spanish month name for a given Date
 * Example: "Octubre"
 */
export function getMonthName(date: Date): string {
  if (isNaN(date.getTime())) return '';
  const name = new Intl.DateTimeFormat(CURRENCY.locale, { month: 'long' }).format(date);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Calculates start and end Date range for a given PeriodType
 */
export function getDateRange(
  period: PeriodType,
  referenceDate: Date = new Date()
): { start: Date; end: Date } {
  const ref = new Date(referenceDate);
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const date = ref.getDate();

  switch (period) {
    case 'daily': {
      const start = new Date(year, month, date, 0, 0, 0, 0);
      const end = new Date(year, month, date, 23, 59, 59, 999);
      return { start, end };
    }
    case 'weekly': {
      // ISO week: Monday to Sunday
      const dayOfWeek = ref.getDay(); // 0 is Sunday, 1 is Monday, ...
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(year, month, date + diffToMonday, 0, 0, 0, 0);
      const sunday = new Date(year, month, date + diffToMonday + 6, 23, 59, 59, 999);
      return { start: monday, end: sunday };
    }
    case 'monthly': {
      const start = new Date(year, month, 1, 0, 0, 0, 0);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
      return { start, end };
    }
    case 'yearly': {
      const start = new Date(year, 0, 1, 0, 0, 0, 0);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);
      return { start, end };
    }
  }
}

/**
 * Calculates the percentage of current against total
 */
export function calculatePercentage(current: number, total: number): number {
  if (!total || total <= 0) return 0;
  const pct = (current / total) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * Determines budget status ('safe' | 'warning' | 'danger') based on ALERT_THRESHOLDS
 */
export function getBudgetStatus(percentage: number): BudgetStatus {
  if (percentage >= ALERT_THRESHOLDS.danger) {
    return 'danger';
  }
  if (percentage >= ALERT_THRESHOLDS.warning) {
    return 'warning';
  }
  return 'safe';
}

/**
 * Simple and efficient class name merger utility
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Simple UUID generator with crypto API and fallback
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
