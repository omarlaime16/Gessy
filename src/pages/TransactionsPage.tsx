import React, { useState } from 'react';
import { Plus, ArrowLeftRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button, Card, EmptyState, Modal, AmountDisplay } from '../components/ui';
import { PeriodSelector, TransactionList, TransactionForm } from '../components/transactions';
import { useCategories, useTransactions } from '../hooks';
import { Transaction, TransactionFormData } from '../types';

export const TransactionsPage: React.FC = () => {
  const { categories } = useCategories();
  const {
    filteredTransactions,
    period,
    setPeriod,
    referenceDate,
    setReferenceDate,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    summary,
    transactionsByDate,
  } = useTransactions(categories);

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Delete confirmation modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Open modal for new transaction
  const handleOpenNew = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  // Open modal to edit existing transaction
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  // Trigger delete confirmation
  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  // Confirm delete action
  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteTransaction(deletingId);
      setDeletingId(null);
    }
  };

  // Close form modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  // Submit handler (create or edit)
  const handleFormSubmit = (data: TransactionFormData) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
    } else {
      addTransaction(data);
    }
    handleCloseForm();
  };

  // Initial form data when editing
  const formInitialData: TransactionFormData | undefined = editingTransaction
    ? {
        category_id: editingTransaction.category_id,
        amount: editingTransaction.amount,
        type: editingTransaction.type,
        description: editingTransaction.description,
        transaction_date: editingTransaction.transaction_date,
        is_recurring: editingTransaction.is_recurring,
        recurring_frequency: editingTransaction.recurring_frequency,
      }
    : undefined;

  const hasTransactions = filteredTransactions && filteredTransactions.length > 0;

  return (
    <PageContainer
      title="Transacciones"
      subtitle="Historial y registro detallado de ingresos y gastos"
      action={
        <Button icon={Plus} size="md" onClick={handleOpenNew}>
          Nueva Transacción
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Top: Period Selector */}
        <PeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          referenceDate={referenceDate}
          onReferenceDateChange={setReferenceDate}
        />

        {/* Below: 3 Summary Mini Cards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Ingresos Mini Card */}
          <Card padding="sm" className="border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ingresos
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                <TrendingUp className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2">
              <AmountDisplay
                amount={summary.income}
                type="income"
                size="lg"
                showSign={false}
              />
            </div>
          </Card>

          {/* Gastos Mini Card */}
          <Card padding="sm" className="border-rose-100/80 bg-gradient-to-br from-white to-rose-50/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Gastos
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
                <TrendingDown className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2">
              <AmountDisplay
                amount={summary.expenses}
                type="expense"
                size="lg"
                showSign={false}
              />
            </div>
          </Card>

          {/* Balance Mini Card */}
          <Card padding="sm" className="border-indigo-100/80 bg-gradient-to-br from-white to-indigo-50/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Balance
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                <Wallet className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2">
              <AmountDisplay
                amount={summary.balance}
                type={summary.balance >= 0 ? 'balance' : 'expense'}
                size="lg"
                showSign={summary.balance < 0}
              />
            </div>
          </Card>
        </div>

        {/* Main: Grouped Transaction List or Empty State */}
        {hasTransactions ? (
          <TransactionList
            transactionsByDate={transactionsByDate}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        ) : (
          <Card className="py-12 border-dashed border-2 border-slate-200">
            <EmptyState
              icon={ArrowLeftRight}
              title="Sin transacciones en este período"
              description="No encontramos movimientos registrados para el período seleccionado. Puedes registrar una nueva transacción ahora."
              action={{
                label: 'Nueva Transacción',
                onClick: handleOpenNew,
                icon: Plus,
              }}
            />
          </Card>
        )}
      </div>

      {/* Floating Action Button (FAB) in bottom-right */}
      <button
        type="button"
        onClick={handleOpenNew}
        aria-label="Registrar nueva transacción"
        title="Nueva Transacción"
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-30 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        categories={categories}
        initialData={formInitialData}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        title="Eliminar transacción"
        size="sm"
      >
        <div className="space-y-4 font-sans">
          <p className="text-sm text-slate-600 leading-relaxed">
            ¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer y afectará el balance y estadísticas del período.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setDeletingId(null)}
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
