export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type TransactionType = 'income' | 'expense';

export type BudgetPeriod = 'monthly' | 'weekly';

export type SavingsGoalStatus = 'active' | 'completed' | 'cancelled';

export type BudgetStatus = 'safe' | 'warning' | 'danger';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  currency: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  sort_order: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  type: TransactionType;
  description: string;
  transaction_date: string;
  is_recurring: boolean;
  recurring_frequency?: PeriodType | null;
  created_at: string;
  category?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount_limit: number;
  period: BudgetPeriod;
  alert_enabled: boolean;
  alert_threshold: number;
  created_at: string;
  category?: Category;
  spent?: number;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  status: SavingsGoalStatus;
  created_at: string;
}

export interface TransactionFormData {
  category_id: string;
  amount: number;
  type: TransactionType;
  description: string;
  transaction_date: string;
  is_recurring: boolean;
  recurring_frequency?: PeriodType | null;
}

export interface BudgetFormData {
  category_id: string;
  amount_limit: number;
  period: BudgetPeriod;
  alert_enabled: boolean;
  alert_threshold: number;
}

export interface SavingsGoalFormData {
  name: string;
  icon: string;
  target_amount: number;
  deadline: string | null;
  status?: SavingsGoalStatus;
  initial_amount?: number;
}

export interface NavItem {
  path: string;
  icon: string;
  label: string;
}
