import React, { useState, useEffect } from 'react';
import { AlertCircle, Bell, Check } from 'lucide-react';
import { BudgetFormData, Category, BudgetPeriod } from '../../types';
import { DEFAULT_CATEGORIES } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';

export interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetFormData) => void;
  categories: Category[];
  existingBudgetCategoryIds: string[];
  initialData?: BudgetFormData & { id?: string };
}

const PERIOD_OPTIONS = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'weekly', label: 'Semanal' },
];

const THRESHOLD_PRESETS = [60, 70, 80, 90];

export const BudgetForm: React.FC<BudgetFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  existingBudgetCategoryIds = [],
  initialData,
}) => {
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [alertEnabled, setAlertEnabled] = useState<boolean>(true);
  const [alertThreshold, setAlertThreshold] = useState<number>(80);

  const [errors, setErrors] = useState<{ category?: string; amount?: string }>({});

  const isEditing = Boolean(initialData);

  // Fallback to DEFAULT_CATEGORIES if none provided
  const allCategories =
    categories && categories.length > 0
      ? categories
      : (DEFAULT_CATEGORIES as unknown as Category[]);

  // Filter out categories that already have budgets, except the one currently being edited
  const selectableCategories = allCategories.filter((c) => {
    if (isEditing && initialData?.category_id === c.id) {
      return true;
    }
    return !existingBudgetCategoryIds.includes(c.id);
  });

  // Populate or reset form whenever modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCategoryId(initialData.category_id || '');
        setAmount(initialData.amount_limit ? String(initialData.amount_limit) : '');
        setPeriod(initialData.period || 'monthly');
        setAlertEnabled(initialData.alert_enabled ?? true);
        setAlertThreshold(initialData.alert_threshold || 80);
      } else {
        setCategoryId('');
        setAmount('');
        setPeriod('monthly');
        setAlertEnabled(true);
        setAlertThreshold(80);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { category?: string; amount?: string } = {};

    if (!categoryId.trim()) {
      newErrors.category = 'Por favor selecciona una categoría';
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'El límite debe ser un monto mayor a 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      category_id: categoryId,
      amount_limit: parsedAmount,
      period,
      alert_enabled: alertEnabled,
      alert_threshold: alertThreshold,
    });

    onClose();
  };

  const selectedCategory = allCategories.find((c) => c.id === categoryId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
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

          {selectableCategories.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              Todas las categorías disponibles ya tienen un presupuesto asignado.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 rounded-xl bg-slate-50/50 border border-slate-200/60">
              {selectableCategories.map((cat) => {
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
          )}

          {errors.category && (
            <p className="flex items-center gap-1 text-xs text-rose-500 font-medium mt-1.5 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.category}</span>
            </p>
          )}
        </div>

        {/* Amount Limit Input */}
        <Input
          label={period === 'weekly' ? 'Límite semanal' : 'Límite mensual'}
          prefix="S/"
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
          error={errors.amount}
          fullWidth
        />

        {/* Period Selector */}
        <Select
          label="Período"
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
          fullWidth
        />

        {/* Alert Toggle and Alert Threshold */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <Toggle
            label="Activar alerta"
            description="Recibe una alerta cuando te acerques al límite"
            checked={alertEnabled}
            onChange={setAlertEnabled}
          />

          {alertEnabled && (
            <div className="animate-fade-in pl-1 pt-1 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 select-none">
                <Bell className="w-3.5 h-3.5 text-indigo-500" />
                <span>Umbral de alerta (% del presupuesto)</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {THRESHOLD_PRESETS.map((preset) => {
                  const isSelected = alertThreshold === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAlertThreshold(preset)}
                      className={cn(
                        'py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 outline-none border flex items-center justify-center gap-1',
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100 ring-2 ring-indigo-600/20'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                      <span>{preset}%</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-500 leading-normal">
                Te notificaremos cuando el gasto alcance el {alertThreshold}% del límite establecido.
              </p>
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
          Guardar Presupuesto
        </Button>
      </form>
    </Modal>
  );
};
