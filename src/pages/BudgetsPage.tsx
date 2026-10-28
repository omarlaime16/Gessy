import React, { useState, useMemo } from 'react';
import { Plus, PieChart } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button, Card, EmptyState, Modal } from '../components/ui';
import { BudgetForm } from '../components/budgets/BudgetForm';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { BudgetAlertBanner } from '../components/budgets/BudgetAlertBanner';
import { BudgetSummary } from '../components/budgets/BudgetSummary';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import type { Budget, BudgetFormData } from '../types';

export const BudgetsPage: React.FC = () => {
  const { categories } = useCategories();
  const { transactions } = useTransactions(categories);
  const {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
    alerts,
    totalBudgeted,
    totalSpent,
  } = useBudgets(transactions, categories);

  // Form modal state (create or edit)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Delete confirmation modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Open modal for creating a new budget
  const handleOpenCreate = () => {
    setEditingBudget(null);
    setIsFormOpen(true);
  };

  // Open modal for editing an existing budget
  const handleOpenEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  // Close form modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
  };

  // Handle form submit (create or update)
  const handleFormSubmit = (data: BudgetFormData) => {
    if (editingBudget) {
      updateBudget(editingBudget.id, data);
    } else {
      addBudget(data);
    }
    handleCloseForm();
  };

  // Trigger delete confirmation dialog
  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
  };

  // Close delete confirmation dialog
  const handleCloseDelete = () => {
    setDeletingId(null);
  };

  // Confirm delete action
  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteBudget(deletingId);
      setDeletingId(null);
    }
  };

  // Budget being deleted for modal details
  const budgetToDelete = useMemo(() => {
    if (!deletingId) return null;
    return budgets.find((b) => b.id === deletingId) || null;
  }, [deletingId, budgets]);

  // Initial data when editing
  const initialFormData: (BudgetFormData & { id?: string }) | undefined = useMemo(() => {
    if (!editingBudget) return undefined;
    return {
      id: editingBudget.id,
      category_id: editingBudget.category_id,
      amount_limit: editingBudget.amount_limit,
      period: editingBudget.period,
      alert_enabled: editingBudget.alert_enabled,
      alert_threshold: editingBudget.alert_threshold,
    };
  }, [editingBudget]);

  // List of category IDs that already have a budget
  const existingBudgetCategoryIds = useMemo(() => {
    return budgets.map((b) => b.category_id);
  }, [budgets]);

  const hasBudgets = budgets && budgets.length > 0;

  return (
    <PageContainer
      title="Presupuestos"
      subtitle="Controla tus gastos por categoría"
      action={
        <Button
          icon={Plus}
          size="md"
          onClick={handleOpenCreate}
        >
          + Nuevo Presupuesto
        </Button>
      }
    >
      <div className="space-y-6">
        {/* 1. Top Section: Budget Alerts Banner (if active alerts) */}
        {alerts && alerts.length > 0 && (
          <BudgetAlertBanner alerts={alerts} />
        )}

        {/* 2. Summary: Overall Budget vs Spent */}
        <BudgetSummary
          totalBudgeted={totalBudgeted}
          totalSpent={totalSpent}
        />

        {/* 3. Budget Grid or Empty State */}
        {hasBudgets ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        ) : (
          <Card className="py-12 border-dashed border-2 border-slate-200">
            <EmptyState
              icon={PieChart}
              title="Sin presupuestos configurados"
              description="Configura tus presupuestos para controlar tus gastos"
              action={{
                label: '+ Nuevo Presupuesto',
                onClick: handleOpenCreate,
                icon: Plus,
              }}
            />
          </Card>
        )}
      </div>

      {/* Floating Action Button (FAB) on mobile */}
      <button
        type="button"
        onClick={handleOpenCreate}
        aria-label="Nuevo Presupuesto"
        title="Nuevo Presupuesto"
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-30 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:hidden"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Budget Form Modal (Create / Edit) */}
      <BudgetForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        categories={categories}
        existingBudgetCategoryIds={existingBudgetCategoryIds}
        initialData={initialFormData}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={handleCloseDelete}
        title="Eliminar presupuesto"
        size="sm"
      >
        <div className="space-y-4 font-sans">
          <p className="text-sm text-slate-600 leading-relaxed">
            ¿Estás seguro de que deseas eliminar este presupuesto
            {budgetToDelete?.category?.name
              ? ` para la categoría "${budgetToDelete.category.name}"`
              : ''}
            ? Esta acción no se puede deshacer y dejarás de recibir alertas sobre estos gastos.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={handleCloseDelete}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
