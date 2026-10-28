import { useState, useEffect, useCallback, useMemo } from 'react';
import { SavingsGoal, SavingsGoalFormData, SavingsGoalStatus } from '../types';
import { calculatePercentage, generateId } from '../lib/utils';

export interface SavingsSummary {
  totalSaved: number;
  totalTarget: number;
  overallPercentage: number;
  activeCount: number;
  completedCount: number;
}

export interface UseSavingsGoalsReturn {
  goals: SavingsGoal[];
  summary: SavingsSummary;
  addGoal: (data: SavingsGoalFormData) => SavingsGoal;
  updateGoal: (id: string, data: Partial<SavingsGoalFormData>) => void;
  deleteGoal: (id: string) => void;
  addFunds: (id: string, amount: number) => { isNewlyCompleted: boolean; goal: SavingsGoal | null };
  withdrawFunds: (id: string, amount: number) => { goal: SavingsGoal | null };
  getGoalById: (id: string) => SavingsGoal | undefined;
}

const STORAGE_KEY = 'gessy_savings_goals';

const INITIAL_DEMO_GOALS: SavingsGoal[] = [
  {
    id: 'demo-goal-1',
    user_id: 'default',
    name: 'Fondo de Emergencia',
    icon: '🛡️',
    target_amount: 3000,
    current_amount: 1850,
    deadline: '2026-12-31',
    status: 'active',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-goal-2',
    user_id: 'default',
    name: 'Viaje de Fin de Año',
    icon: '✈️',
    target_amount: 1500,
    current_amount: 1500,
    deadline: '2026-12-15',
    status: 'completed',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-goal-3',
    user_id: 'default',
    name: 'Laptop Nueva',
    icon: '💻',
    target_amount: 4200,
    current_amount: 1200,
    deadline: '2027-03-31',
    status: 'active',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Loads savings goals from localStorage with fallback to initial demo goals
 */
function getInitialGoals(): SavingsGoal[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_GOALS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(
          (item): item is SavingsGoal =>
            item !== null &&
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            typeof item.target_amount === 'number' &&
            typeof item.current_amount === 'number'
        );
      }
    }
  } catch (error) {
    console.error('Error al cargar metas de ahorro de localStorage:', error);
  }
  return INITIAL_DEMO_GOALS;
}

/**
 * Hook to manage savings goals with localStorage persistence and calculations
 */
export function useSavingsGoals(): UseSavingsGoalsReturn {
  const [goals, setGoals] = useState<SavingsGoal[]>(getInitialGoals);

  // Persist to localStorage whenever goals change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Error al guardar metas de ahorro en localStorage:', error);
    }
  }, [goals]);

  // Add new savings goal
  const addGoal = useCallback((data: SavingsGoalFormData): SavingsGoal => {
    const target = Math.max(0, Number(data.target_amount) || 0);
    const initial = Math.max(0, Number(data.initial_amount) || 0);
    const isCompleted = initial >= target && target > 0;

    const newGoal: SavingsGoal = {
      id: generateId(),
      user_id: 'default',
      name: data.name.trim(),
      icon: data.icon || '🎯',
      target_amount: target,
      current_amount: initial,
      deadline: data.deadline ? data.deadline : null,
      status: data.status || (isCompleted ? 'completed' : 'active'),
      created_at: new Date().toISOString(),
    };

    setGoals((prev) => [newGoal, ...prev]);
    return newGoal;
  }, []);

  // Update existing savings goal
  const updateGoal = useCallback((id: string, data: Partial<SavingsGoalFormData>) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const target = data.target_amount !== undefined ? Number(data.target_amount) : g.target_amount;
        const current = g.current_amount;
        let status = data.status || g.status;

        // Auto update status if target amount changes
        if (data.target_amount !== undefined) {
          if (current >= target && status === 'active') {
            status = 'completed';
          } else if (current < target && status === 'completed') {
            status = 'active';
          }
        }

        return {
          ...g,
          ...(data.name !== undefined && { name: data.name.trim() }),
          ...(data.icon !== undefined && { icon: data.icon }),
          ...(data.target_amount !== undefined && { target_amount: target }),
          ...(data.deadline !== undefined && { deadline: data.deadline || null }),
          status,
        };
      })
    );
  }, []);

  // Delete savings goal
  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // Add funds to a goal
  const addFunds = useCallback(
    (id: string, amount: number): { isNewlyCompleted: boolean; goal: SavingsGoal | null } => {
      if (amount <= 0) return { isNewlyCompleted: false, goal: null };

      const currentGoal = goals.find((g) => g.id === id);
      if (!currentGoal) return { isNewlyCompleted: false, goal: null };

      const newCurrent = currentGoal.current_amount + amount;
      const wasCompleted =
        currentGoal.status === 'completed' || currentGoal.current_amount >= currentGoal.target_amount;
      const isNowCompleted = newCurrent >= currentGoal.target_amount;
      const isNewlyCompleted = !wasCompleted && isNowCompleted;

      const status: SavingsGoalStatus = isNowCompleted ? 'completed' : currentGoal.status;

      const updated: SavingsGoal = {
        ...currentGoal,
        current_amount: newCurrent,
        status,
      };

      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));

      return { isNewlyCompleted, goal: updated };
    },
    [goals]
  );

  // Withdraw funds from a goal
  const withdrawFunds = useCallback(
    (id: string, amount: number): { goal: SavingsGoal | null } => {
      if (amount <= 0) return { goal: null };

      const currentGoal = goals.find((g) => g.id === id);
      if (!currentGoal) return { goal: null };

      const newCurrent = Math.max(0, currentGoal.current_amount - amount);
      const status: SavingsGoalStatus =
        newCurrent < currentGoal.target_amount && currentGoal.status === 'completed'
          ? 'active'
          : currentGoal.status;

      const updated: SavingsGoal = {
        ...currentGoal,
        current_amount: newCurrent,
        status,
      };

      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));

      return { goal: updated };
    },
    [goals]
  );

  // Get goal by id
  const getGoalById = useCallback(
    (id: string): SavingsGoal | undefined => {
      return goals.find((g) => g.id === id);
    },
    [goals]
  );

  // Calculate summary metrics
  const summary: SavingsSummary = useMemo(() => {
    const totalSaved = goals.reduce((acc, g) => acc + (g.current_amount || 0), 0);
    const totalTarget = goals.reduce((acc, g) => acc + (g.target_amount || 0), 0);
    const overallPercentage = calculatePercentage(totalSaved, totalTarget);
    const activeCount = goals.filter((g) => g.status === 'active').length;
    const completedCount = goals.filter((g) => g.status === 'completed').length;

    return {
      totalSaved,
      totalTarget,
      overallPercentage,
      activeCount,
      completedCount,
    };
  }, [goals]);

  return {
    goals,
    summary,
    addGoal,
    updateGoal,
    deleteGoal,
    addFunds,
    withdrawFunds,
    getGoalById,
  };
}
