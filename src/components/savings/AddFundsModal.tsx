import React, { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { SavingsGoal } from '../../types';
import { calculatePercentage, cn, formatCurrency } from '../../lib/utils';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ProgressBar } from '../ui/ProgressBar';

export type FundsOperationMode = 'add' | 'withdraw';

export interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  onConfirm: (goalId: string, amount: number, mode: FundsOperationMode) => void;
}

const PRESET_AMOUNTS = [20, 50, 100, 200, 500];

export const AddFundsModal: React.FC<AddFundsModalProps> = ({
  isOpen,
  onClose,
  goal,
  onConfirm,
}) => {
  const [mode, setMode] = useState<FundsOperationMode>('add');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setMode('add');
      setAmount('');
      setError('');
    }
  }, [isOpen, goal]);

  if (!goal) return null;

  const currentAmount = goal.current_amount;
  const targetAmount = goal.target_amount;
  const parsedAmount = parseFloat(amount) || 0;

  // Calculate projected new amount
  const projectedAmount =
    mode === 'add'
      ? currentAmount + parsedAmount
      : Math.max(0, currentAmount - parsedAmount);

  const projectedPercentage = calculatePercentage(projectedAmount, targetAmount);
  const currentPercentage = calculatePercentage(currentAmount, targetAmount);
  const willReachGoal = mode === 'add' && projectedAmount >= targetAmount && currentAmount < targetAmount;

  const handlePresetClick = (preset: number) => {
    const nextAmount = (parseFloat(amount) || 0) + preset;
    setAmount(String(nextAmount));
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!parsedAmount || parsedAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    if (mode === 'withdraw' && parsedAmount > currentAmount) {
      setError(`No puedes retirar más de lo ahorrado actual (${formatCurrency(currentAmount)})`);
      return;
    }

    onConfirm(goal.id, parsedAmount, mode);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{goal.icon || '🎯'}</span>
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-snug">
              {mode === 'add' ? 'Aportar a meta' : 'Retirar de meta'}
            </h2>
            <p className="text-xs text-slate-500 font-normal">{goal.name}</p>
          </div>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Toggle Mode: Aportar vs Retirar */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('add');
              setError('');
            }}
            className={cn(
              'flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-150',
              mode === 'add'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            Aportar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('withdraw');
              setError('');
            }}
            className={cn(
              'flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-150',
              mode === 'withdraw'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
            Retirar
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <Input
            label={mode === 'add' ? 'Monto a aportar' : 'Monto a retirar'}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            prefix="S/"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (error) setError('');
            }}
            error={error}
            autoFocus
          />

          {/* Quick presets */}
          <div className="mt-2.5">
            <span className="block text-[11px] font-semibold text-slate-500 mb-1.5 select-none">
              Montos rápidos {mode === 'add' ? '(sumar)' : '(sumar)'}
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200/60 active:scale-95"
                >
                  +{formatCurrency(preset)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Preview Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Progreso proyectado</span>
            <span className="text-slate-800 font-bold">
              {Math.round(currentPercentage)}% →{' '}
              <span
                className={cn(
                  projectedPercentage >= 100
                    ? 'text-emerald-600'
                    : mode === 'add'
                    ? 'text-indigo-600'
                    : 'text-rose-600'
                )}
              >
                {Math.round(projectedPercentage)}%
              </span>
            </span>
          </div>

          <ProgressBar
            value={projectedPercentage}
            color={
              projectedPercentage >= 100
                ? 'emerald'
                : projectedPercentage < 35
                ? 'amber'
                : 'indigo'
            }
            size="md"
          />

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 text-slate-600">
            <span>Monto resultante:</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatCurrency(projectedAmount)} de {formatCurrency(targetAmount)}
            </span>
          </div>

          {willReachGoal && (
            <div className="flex items-center gap-1.5 p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>¡Increíble! Con este aporte completarás tu meta al 100% 🎉</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            variant={mode === 'add' ? 'primary' : 'danger'}
            type="submit"
            disabled={!parsedAmount || parsedAmount <= 0}
          >
            {mode === 'add' ? 'Confirmar Aporte' : 'Confirmar Retiro'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
