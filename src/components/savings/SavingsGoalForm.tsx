import React, { useState, useEffect } from 'react';
import { SavingsGoalFormData } from '../../types';
import { cn } from '../../lib/utils';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface SavingsGoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SavingsGoalFormData) => void;
  initialData?: SavingsGoalFormData & { id?: string };
}

const AVAILABLE_ICONS = [
  '🛡️',
  '✈️',
  '💻',
  '🚗',
  '🏠',
  '📱',
  '🎓',
  '🏖️',
  '🎮',
  '🎁',
  '💍',
  '🚲',
  '🏥',
  '💰',
];

export const SavingsGoalForm: React.FC<SavingsGoalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = Boolean(initialData && initialData.id);

  const [name, setName] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [initialAmount, setInitialAmount] = useState<string>('');
  const [icon, setIcon] = useState<string>(AVAILABLE_ICONS[0]);
  const [deadline, setDeadline] = useState<string>('');

  const [errors, setErrors] = useState<{ name?: string; targetAmount?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setTargetAmount(initialData.target_amount ? String(initialData.target_amount) : '');
        setInitialAmount('');
        setIcon(initialData.icon || AVAILABLE_ICONS[0]);
        setDeadline(initialData.deadline ? initialData.deadline.slice(0, 10) : '');
      } else {
        setName('');
        setTargetAmount('');
        setInitialAmount('');
        setIcon(AVAILABLE_ICONS[0]);
        setDeadline('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; targetAmount?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Por favor ingresa el nombre de la meta';
    }

    const parsedTarget = parseFloat(targetAmount);
    if (!targetAmount || isNaN(parsedTarget) || parsedTarget <= 0) {
      newErrors.targetAmount = 'El monto objetivo debe ser mayor a 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const parsedInitial = initialAmount ? parseFloat(initialAmount) : 0;

    onSubmit({
      name: name.trim(),
      icon,
      target_amount: parsedTarget,
      deadline: deadline ? deadline : null,
      ...(isEditing ? {} : { initial_amount: isNaN(parsedInitial) ? 0 : parsedInitial }),
      ...(initialData?.status ? { status: initialData.status } : {}),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar meta de ahorro' : 'Nueva meta de ahorro'}
      description={
        isEditing
          ? 'Actualiza los datos de tu meta financiera'
          : 'Define tu objetivo, monto y fecha límite para comenzar a ahorrar'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Icon selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2 select-none">
            Icono de la meta
          </label>
          <div className="grid grid-cols-7 gap-2">
            {AVAILABLE_ICONS.map((emoji) => {
              const isSelected = icon === emoji;
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    'h-11 rounded-xl text-xl flex items-center justify-center transition-all duration-150',
                    'hover:bg-slate-100 active:scale-95 border',
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 shadow-xs ring-2 ring-indigo-500/30 scale-105'
                      : 'bg-white border-slate-200'
                  )}
                  title={emoji}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>

        {/* Goal Name */}
        <Input
          label="Nombre de la meta"
          placeholder="ej: Vacaciones 2027"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) {
              setErrors((prev) => ({ ...prev, name: undefined }));
            }
          }}
          error={errors.name}
          required
        />

        {/* Target Amount */}
        <Input
          label="Monto objetivo"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          prefix="S/"
          value={targetAmount}
          onChange={(e) => {
            setTargetAmount(e.target.value);
            if (errors.targetAmount) {
              setErrors((prev) => ({ ...prev, targetAmount: undefined }));
            }
          }}
          error={errors.targetAmount}
          required
        />

        {/* Initial Amount (Only for creation) */}
        {!isEditing && (
          <Input
            label="Monto inicial (opcional)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            prefix="S/"
            value={initialAmount}
            onChange={(e) => setInitialAmount(e.target.value)}
            helperText="Si ya tienes un ahorro previo para esta meta, ingrésalo aquí"
          />
        )}

        {/* Deadline Date */}
        <Input
          label="Fecha límite (opcional)"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          helperText="Te ayudará a calcular cuánto ahorrar periódicamente"
        />

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {isEditing ? 'Actualizar Meta' : 'Guardar Meta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
