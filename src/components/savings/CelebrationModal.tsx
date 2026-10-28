import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { SavingsGoal } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  if (!goal) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="p-6 text-center space-y-5 font-sans">
        {/* Celebration Badges */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-indigo-500 p-1 shadow-lg shadow-emerald-500/20 animate-bounce">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-4xl">
              {goal.icon || '🎉'}
            </div>
          </div>
          <div className="absolute -top-1 -right-2 bg-amber-400 text-white rounded-full p-1.5 shadow-md">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div className="absolute -bottom-1 -left-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-md">
            <Trophy className="w-4 h-4 fill-white" />
          </div>
        </div>

        {/* Emojis row */}
        <div className="flex items-center justify-center gap-2 text-2xl">
          <span>🎉</span>
          <span>🚀</span>
          <span>🥳</span>
        </div>

        {/* Title and Goal Info */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            ¡Meta Alcanzada!
          </h2>
          <p className="text-sm font-semibold text-indigo-600">
            {goal.name}
          </p>
        </div>

        {/* Total saved badge */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
          <span className="block text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            Total Completado
          </span>
          <span className="text-2xl font-black text-emerald-700 tabular-nums">
            {formatCurrency(goal.current_amount)}
          </span>
        </div>

        {/* Motivational Message */}
        <p className="text-xs text-slate-600 leading-relaxed px-2">
          ¡Felicidades por este gran logro! Tu constancia, disciplina y esfuerzo han dado frutos. Cada sol ahorrado te acerca más a tu libertad y tranquilidad financiera.
        </p>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
          >
            ¡Excelente! Continuar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
