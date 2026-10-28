import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowRight,
  PieChart,
  ArrowLeftRight,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, Button, ProgressBar, AmountDisplay, EmptyState } from '../components/ui';
import { TransactionForm } from '../components/transactions';
import { useCategories, useTransactions } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { formatShortDate } from '../lib/utils';
import { TransactionFormData } from '../types';

interface CategorySpending {
  id: string;
  name: string;
  icon: string;
  amount: number;
  percentage: number;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.full_name ? user.full_name.trim().split(' ')[0] : 'Usuario';

  const { categories, getCategoryById } = useCategories();
  const {
    transactions,
    filteredTransactions,
    summary,
    addTransaction,
  } = useTransactions(categories);

  // Quick action form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formInitialData, setFormInitialData] = useState<TransactionFormData | undefined>(undefined);

  const handleNewIncome = () => {
    setFormInitialData({
      type: 'income',
      amount: 0,
      category_id: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
      is_recurring: false,
    });
    setIsFormOpen(true);
  };

  const handleNewExpense = () => {
    setFormInitialData({
      type: 'expense',
      amount: 0,
      category_id: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
      is_recurring: false,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormInitialData(undefined);
  };

  const handleFormSubmit = (data: TransactionFormData) => {
    addTransaction(data);
    handleCloseForm();
  };

  // Compute top 5 categories by expense amount
  const topCategories: CategorySpending[] = useMemo(() => {
    const expenseTransactions = filteredTransactions.filter((t) => t.type === 'expense');
    const totalExpense = summary.expenses;

    const spendingMap = new Map<string, number>();
    for (const tx of expenseTransactions) {
      const prev = spendingMap.get(tx.category_id) || 0;
      spendingMap.set(tx.category_id, prev + Math.abs(tx.amount));
    }

    const results: CategorySpending[] = [];
    for (const [catId, amt] of spendingMap.entries()) {
      const cat = getCategoryById(catId) || categories.find((c) => c.id === catId);
      const percentage = totalExpense > 0 ? (amt / totalExpense) * 100 : 0;
      results.push({
        id: catId,
        name: cat?.name || 'General',
        icon: cat?.icon || '📦',
        amount: amt,
        percentage: Math.round(percentage * 10) / 10,
      });
    }

    return results.sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [filteredTransactions, summary.expenses, getCategoryById, categories]);

  // Last 5 transactions overall
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  return (
    <PageContainer
      title="Dashboard"
      subtitle={`¡Hola, ${firstName}! Aquí está el resumen financiero de tu mes.`}
      action={
        <Button
          icon={Plus}
          size="md"
          onClick={() => {
            setFormInitialData(undefined);
            setIsFormOpen(true);
          }}
        >
          Nueva Transacción
        </Button>
      }
    >
      <div className="space-y-6">
        {/* 1. Summary Cards Row (3 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Ingresos Card */}
          <Card hoverable className="relative overflow-hidden border-emerald-100/90">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                Ingresos
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                <TrendingUp className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4">
              <AmountDisplay
                amount={summary.income}
                type="income"
                size="xl"
                showSign={false}
              />
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Total de ingresos registrados este mes
              </p>
            </div>
          </Card>

          {/* Gastos Card */}
          <Card hoverable className="relative overflow-hidden border-rose-100/90">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                Gastos
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
                <TrendingDown className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4">
              <AmountDisplay
                amount={summary.expenses}
                type="expense"
                size="xl"
                showSign={false}
              />
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Total de gastos consumidos este mes
              </p>
            </div>
          </Card>

          {/* Balance Card */}
          <Card hoverable className="relative overflow-hidden border-indigo-100/90 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">
                Balance
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                <Wallet className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-4">
              <AmountDisplay
                amount={summary.balance}
                type={summary.balance >= 0 ? 'balance' : 'expense'}
                size="xl"
                showSign={summary.balance < 0}
              />
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {summary.balance >= 0
                  ? 'Disponible para ahorro o inversiones'
                  : 'Déficit del mes actual'}
              </p>
            </div>
          </Card>
        </div>

        {/* 2. Quick Actions: Row of 2 buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleNewIncome}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 font-bold text-sm border border-emerald-200/90 shadow-xs transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span>+ Nuevo Ingreso</span>
          </button>

          <button
            type="button"
            onClick={handleNewExpense}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-rose-50 hover:bg-rose-100/80 text-rose-700 font-bold text-sm border border-rose-200/90 shadow-xs transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-500/40"
          >
            <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span>+ Nuevo Gasto</span>
          </button>
        </div>

        {/* 3. Lower Row: Spending by Category & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending by Category Card */}
          <Card className="flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Gastos por Categoría
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distribución de los principales gastos del mes
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                Top 5
              </span>
            </div>

            {topCategories.length > 0 ? (
              <div className="space-y-4 my-auto">
                {topCategories.map((item) => (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="text-lg select-none">{item.icon}</span>
                        <span className="font-semibold text-slate-800 truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-semibold text-slate-400 tabular-nums">
                          {item.percentage}%
                        </span>
                        <AmountDisplay
                          amount={item.amount}
                          type="expense"
                          size="sm"
                          showSign={false}
                        />
                      </div>
                    </div>
                    <ProgressBar
                      value={item.percentage}
                      color="rose"
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 my-auto">
                <EmptyState
                  icon={PieChart}
                  title="Sin gastos este mes"
                  description="Aún no has registrado ningún gasto en este período."
                  action={{
                    label: '+ Registrar Gasto',
                    onClick: handleNewExpense,
                    icon: Plus,
                  }}
                />
              </div>
            )}
          </Card>

          {/* Recent Transactions Card */}
          <Card className="flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Últimas Transacciones
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Movimientos más recientes registrados
                </p>
              </div>
              <Link
                to="/transactions"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline active:scale-95 transition-all"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="divide-y divide-slate-100 my-auto">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0 shadow-2xs">
                        <span>{tx.category?.icon || (tx.type === 'income' ? '💵' : '💸')}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate leading-snug">
                          {tx.category?.name || (tx.type === 'income' ? 'Ingreso' : 'Gasto')}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-[160px] sm:max-w-xs mt-0.5">
                          {tx.description || formatShortDate(tx.transaction_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0 text-right">
                      <AmountDisplay
                        amount={tx.amount}
                        type={tx.type}
                        size="sm"
                        showSign
                      />
                      <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {formatShortDate(tx.transaction_date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 my-auto">
                <EmptyState
                  icon={ArrowLeftRight}
                  title="Sin transacciones aún"
                  description="Comienza a registrar tus movimientos para visualizar tu historial financiero aquí."
                  action={{
                    label: '+ Registrar Movimiento',
                    onClick: handleNewExpense,
                    icon: Plus,
                  }}
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* TransactionForm modal for Quick Actions */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        categories={categories}
        initialData={formInitialData}
      />
    </PageContainer>
  );
};
