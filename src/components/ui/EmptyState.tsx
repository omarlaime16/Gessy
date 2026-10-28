import React from 'react';
import { type LucideIcon, HelpCircle } from 'lucide-react';
import { Button, type ButtonVariant } from './Button';
import { cn } from '../../utils/cn';

export interface EmptyStateActionConfig {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: ButtonVariant;
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode | EmptyStateActionConfig;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = HelpCircle,
  title,
  description,
  action,
  className,
}) => {
  const isActionConfig = (act: unknown): act is EmptyStateActionConfig => {
    return typeof act === 'object' && act !== null && 'label' in act && 'onClick' in act;
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-10 px-4 sm:px-6 font-sans',
        className
      )}
    >
      {/* Icon Badge */}
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100/60 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-slate-800 tracking-tight">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mt-1.5 leading-relaxed">
          {description}
        </p>
      )}

      {/* Action CTA */}
      {action && (
        <div className="mt-5">
          {isActionConfig(action) ? (
            <Button
              variant={action.variant || 'primary'}
              icon={action.icon}
              onClick={action.onClick}
              size="md"
            >
              {action.label}
            </Button>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
};
