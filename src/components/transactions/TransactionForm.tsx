import React, { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, AlertCircle } from 'lucide-react';
import { TransactionFormData, Category, TransactionType, PeriodType } from '../../types';
import { DEFAULT_CATEGORIES } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';

export interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => void;
  categories: Category[];
  initialData?: TransactionFormData;
}

const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(getTodayDateString());
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringFrequency, setRecurringFrequency] = useState<PeriodType>('monthly');

  const [errors, setErrors] = useState<{ amount?: string; category?: string }>({});

  const availableCategories =
    categories && categories.length > 0
      ? categories
      : (DEFAULT_CATEGORIES as unknown as Category[]);

  // Reset or fill form data on open / initialData change
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type || 'expense');
        setAmount(initialData.amount ? String(initialData.amount) : '');
        setCategoryId(initialData.category_id || '');
        setDescription(initialData.description || '');
        setTransactionDate(
          initialData.transaction_date
            ? initialData.transaction_date.slice(0, 10)
            : getTodayDateString()
        );
        setIsRecurring(Boolean(initialData.is_recurring));
        setRecurringFrequency(initialData.recurring_frequency || 'monthly');
      } else {
        setType('expense');
        setAmount('');
        setCategoryId('');
        setDescription('');
        setTransactionDate(getTodayDateString());
        setIsRecurring(false);
        setRecurringFrequency('monthly');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { amount?: string; category?: string } = {};

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'El monto debe ser un número mayor a 0';
    }

    if (!categoryId.trim()) {
      newErrors.category = 'Por favor selecciona una categoría';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      category_id: categoryId,
      amount: parsedAmount,
      type,
      description: description.trim(),
      transaction_date: transactionDate,
      is_recurring: isRecurring,
      recurring_frequency: isRecurring ? recurringFrequency : null,
    });

    onClose();
  };

  const selectedCategory = availableCategories.find((c) => c.id === categoryId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Transacción' : 'Nueva Transacción'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {/* Type Toggle: Gasto vs Ingreso */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={cn(
              'flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all outline-none',
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                : 'text-slate-600 hover:text-slate-900 active:scale-[0.98]'
            )}
          >
            <ArrowDownRight className="w-4 h-4 flex-shrink-0" />
            <span>Gasto</span>
          </button>

          <button
            type="button"
            onClick={() => setType('income')}
            className={cn(
              'flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all outline-none',
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                : 'text-slate-600 hover:text-slate-900 active:scale-[0.98]'
            )}
          >
            <ArrowUpRight className="w-4 h-4 flex-shrink-0" />
            <span>Ingreso</span>
          </button>
        </div>

        {/* Large Prominent Amount Input */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col items-center">
          <label
            htmlFor="tx-amount"
            className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1"
          >
            Monto de la transacción
          </label>
          <div className="relative flex items-center justify-center w-full">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-400 select-none mr-2">
              S/
            </span>
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) {
                  setErrors((prev) => ({ ...prev, amount: undefined }));
                }
              }}
              className={cn(
                'text-3xl sm:text-4xl font-extrabold bg-transparent text-center outline-none w-44 sm:w-52 tabular-nums',
                'placeholder:text-slate-300',
                type === 'expense' ? 'text-rose-600' : 'text-emerald-600'
              )}
              autoFocus
            />
          </div>
          {errors.amount && (
            <p className="flex items-center gap-1 text-xs text-rose-500 font-medium mt-2 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.amount}</span>
            </p>
          )}
        </div>

        {/* Category Selector Grid */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 select-none">
              Categoría <span className="text-rose-500">*</span>
            </label>
            {selectedCategory && (
              <span className="text-xs text-indigo-600 font-semibold truncate max-w-[200px]">
                {selectedCategory.icon} {selectedCategory.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 rounded-xl bg-slate-50/50 border border-slate-200/60">
            {availableCategories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(cat.id);
                    if (errors.category) {
                      setErrors((prev) => ({ ...prev, category: undefined }));
                    }
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-150 active:scale-95 outline-none',
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100 ring-2 ring-indigo-600/20'
                      : 'bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200/80 hover:border-slate-300'
                  )}
                >
                  <span className="text-2xl mb-1 select-none">{cat.icon}</span>
                  <span
                    className={cn(
                      'text-xs font-semibold truncate w-full px-1',
                      isSelected ? 'text-white' : 'text-slate-700'
                    )}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>

          {errors.category && (
            <p className="flex items-center gap-1 text-xs text-rose-500 font-medium mt-1.5 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.category}</span>
            </p>
          )}
        </div>

        {/* Description Input */}
        <Input
          label="Descripción (opcional)"
          placeholder="Ej. Almuerzo familiar, Netflix, Farmacia..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
        />

        {/* Date Input */}
        <Input
          type="date"
          label="Fecha"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          fullWidth
        />

        {/* Recurring Toggle and Frequency */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <Toggle
            label="¿Es recurrente?"
            description="Se registrará automáticamente de forma periódica"
            checked={isRecurring}
            onChange={setIsRecurring}
          />

          {isRecurring && (
            <div className="animate-fade-in pl-1">
              <Select
                label="Frecuencia de repetición"
                value={recurringFrequency}
                onChange={(e) => setRecurringFrequency(e.target.value as PeriodType)}
                options={[
                  { value: 'daily', label: 'Diario' },
                  { value: 'weekly', label: 'Semanal' },
                  { value: 'monthly', label: 'Mensual' },
                ]}
                fullWidth
              />
            </div>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          className="mt-6"
        >
          Guardar Transacción
        </Button>
      </form>
    </Modal>
  );
};
