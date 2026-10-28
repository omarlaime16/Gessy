import React, { useState, useMemo } from 'react';
import { Plus, Target, CheckCircle2, Clock } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, EmptyState, Modal, Button } from '../components/ui';
import {
  SavingsSummary,
  SavingsGoalCard,
  SavingsGoalForm,
  AddFundsModal,
  CelebrationModal,
} from '../components/savings';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { SavingsGoal, SavingsGoalFormData } from '../types';
import { cn, formatCurrency } from '../lib/utils';

type FilterTab = 'all' | 'active' | 'completed';

export const SavingsPage: React.FC = () => {
  const {
    goals,
    summary,
    addGoal,
    updateGoal,
    deleteGoal,
    addFunds,
    withdrawFunds,
  } = useSavingsGoals();

  // Active filter tab
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Form modal state (create / edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Add/Withdraw funds modal state
  const [fundsGoal, setFundsGoal] = useState<SavingsGoal | null>(null);

  // Celebration modal state
  const [celebrationGoal, setCelebrationGoal] = useState<SavingsGoal | null>(null);

  // Delete confirmation modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered goals based on activeTab
  const filteredGoals = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return goals.filter((g) => g.status === 'active');
      case 'completed':
        return goals.filter((g) => g.status === 'completed');
      case 'all':
      default:
        return goals;
    }
  }, [goals, activeTab]);

  // Goal being deleted
  const goalToDelete = useMemo(() => {
    if (!deletingId) return null;
    return goals.find((g) => g.id === deletingId) || null;
  }, [deletingId, goals]);

  // Handlers for Form Modal
  const handleOpenCreate = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGoal(null);
  };

  const handleFormSubmit = (data: SavingsGoalFormData) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
    } else {
      addGoal(data);
    }
    handleCloseForm();
  };

  // Handlers for Add/Withdraw Funds
  const handleOpenFunds = (goal: SavingsGoal) => {
    setFundsGoal(goal);
  };

  const handleCloseFunds = () => {
    setFundsGoal(null);
  };

  const handleFundsConfirm = (
    goalId: string,
    amount: number,
    mode: 'add' | 'withdraw'
  ) => {
    if (mode === 'add') {
      const result = addFunds(goalId, amount);
      if (result.isNewlyCompleted && result.goal) {
        setCelebrationGoal(result.goal);
      }
    } else {
      withdrawFunds(goalId, amount);
    }
    handleCloseFunds();
  };

  // Handlers for Delete Modal
  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
  };

  const handleCloseDelete = () => {
    setDeletingId(null);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteGoal(deletingId);
      setDeletingId(null);
    }
  };

  // Form initial data for edit
  const initialFormData = useMemo(() => {
    if (!editingGoal) return undefined;
    return {
      id: editingGoal.id,
      name: editingGoal.name,
      icon: editingGoal.icon,
      target_amount: editingGoal.target_amount,
      deadline: editingGoal.deadline,
      status: editingGoal.status,
    };
  }, [editingGoal]);

  return (
    <PageContainer
      title="Metas de Ahorro"
      subtitle="Visualiza tus objetivos y monitorea tu progreso hacia tus sueños"
      action={
        <Button icon={Plus} size="md" onClick={handleOpenCreate}>
          Nueva Meta
        </Button>
      }
    >
      <div className="space-y-6">
        {/* 1. Top Summary Card */}
        <SavingsSummary summary={summary} />

        {/* 2. Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap',
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            Todas
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-md text-[10px] font-bold',
                activeTab === 'all'
                  ? 'bg-indigo-700/80 text-white'
                  : 'bg-slate-200/80 text-slate-700'
              )}
            >
              {goals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap',
              activeTab === 'active'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            En progreso
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-md text-[10px] font-bold',
                activeTab === 'active'
                  ? 'bg-indigo-700/80 text-white'
                  : 'bg-slate-200/80 text-slate-700'
              )}
            >
              {summary.activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap',
              activeTab === 'completed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completadas
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-md text-[10px] font-bold',
                activeTab === 'completed'
                  ? 'bg-indigo-700/80 text-white'
                  : 'bg-slate-200/80 text-slate-700'
              )}
            >
              {summary.completedCount}
            </span>
          </button>
        </div>

        {/* 3. Goals Grid or Empty State */}
        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredGoals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onAddFunds={handleOpenFunds}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        ) : (
          <Card className="py-12 border-dashed border-2 border-slate-200">
            {goals.length === 0 ? (
              <EmptyState
                icon={Target}
                title="Crea tu primera meta de ahorro"
                description="Ahorra para unas vacaciones, fondo de emergencia o un auto nuevo. Te ayudaremos a alcanzar tu objetivo paso a paso."
                action={{
                  label: '+ Nueva Meta',
                  onClick: handleOpenCreate,
                  icon: Plus,
                }}
              />
            ) : activeTab === 'active' ? (
              <EmptyState
                icon={CheckCircle2}
                title="No tienes metas en progreso"
                description="¡Excelente trabajo! Has completado todas tus metas activas o necesitas crear una nueva."
                action={{
                  label: '+ Nueva Meta',
                  onClick: handleOpenCreate,
                  icon: Plus,
                }}
              />
            ) : (
              <EmptyState
                icon={Target}
                title="Sin metas completadas aún"
                description="Continúa aportando a tus metas en progreso para celebrar tus logros aquí."
                action={{
                  label: 'Ver metas en progreso',
                  onClick: () => setActiveTab('active'),
                }}
              />
            )}
          </Card>
        )}
      </div>

      {/* Floating Action Button (FAB) on mobile */}
      <button
        type="button"
        onClick={handleOpenCreate}
        aria-label="Nueva Meta"
        title="Nueva Meta"
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-30 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:hidden"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Goal Form Modal (Create / Edit) */}
      <SavingsGoalForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={initialFormData}
      />

      {/* Add / Withdraw Funds Modal */}
      <AddFundsModal
        isOpen={Boolean(fundsGoal)}
        onClose={handleCloseFunds}
        goal={fundsGoal}
        onConfirm={handleFundsConfirm}
      />

      {/* Goal Reached Celebration Modal */}
      <CelebrationModal
        isOpen={Boolean(celebrationGoal)}
        onClose={() => setCelebrationGoal(null)}
        goal={celebrationGoal}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={handleCloseDelete}
        title="Eliminar meta de ahorro"
        size="sm"
      >
        <div className="space-y-4 font-sans">
          <p className="text-sm text-slate-600 leading-relaxed">
            ¿Estás seguro de que deseas eliminar la meta{' '}
            {goalToDelete ? <strong>"{goalToDelete.name}"</strong> : 'seleccionada'}?
            Esta acción no se puede deshacer y se perderá el registro de los ahorros acumulados
            {goalToDelete ? ` (${formatCurrency(goalToDelete.current_amount)})` : ''}.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={handleCloseDelete}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
