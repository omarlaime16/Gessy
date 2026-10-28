import React from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  PieChart,
  Lightbulb,
  Info,
  Activity,
} from 'lucide-react';
import { SmartInsight, SmartInsightType } from '../../hooks/useAnalytics';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge, BadgeVariant } from '../ui/Badge';
import { cn } from '../../lib/utils';

export interface SmartInsightsCardProps {
  insights: SmartInsight[];
  className?: string;
}

interface InsightStyleConfig {
  container: string;
  iconBg: string;
  title: string;
  description: string;
  badgeVariant: BadgeVariant;
  badgeLabel: string;
}

const STYLE_MAP: Record<SmartInsightType, InsightStyleConfig> = {
  positive: {
    container: 'border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50/70',
    iconBg: 'bg-emerald-100 text-emerald-700',
    title: 'text-emerald-950',
    description: 'text-emerald-800/90',
    badgeVariant: 'success',
    badgeLabel: 'Positivo',
  },
  warning: {
    container: 'border-amber-200/80 bg-amber-50/40 hover:bg-amber-50/70',
    iconBg: 'bg-amber-100 text-amber-700',
    title: 'text-amber-950',
    description: 'text-amber-800/90',
    badgeVariant: 'warning',
    badgeLabel: 'Atención',
  },
  info: {
    container: 'border-indigo-200/80 bg-indigo-50/40 hover:bg-indigo-50/70',
    iconBg: 'bg-indigo-100 text-indigo-700',
    title: 'text-indigo-950',
    description: 'text-indigo-800/90',
    badgeVariant: 'info',
    badgeLabel: 'Info',
  },
  tip: {
    container: 'border-sky-200/80 bg-sky-50/40 hover:bg-sky-50/70',
    iconBg: 'bg-sky-100 text-sky-700',
    title: 'text-sky-950',
    description: 'text-sky-800/90',
    badgeVariant: 'default',
    badgeLabel: 'Consejo',
  },
};

const resolveInsightIcon = (iconName: string) => {
  switch (iconName) {
    case 'TrendingUp':
      return <TrendingUp className="w-5 h-5 flex-shrink-0" />;
    case 'TrendingDown':
      return <TrendingDown className="w-5 h-5 flex-shrink-0" />;
    case 'ShieldCheck':
      return <ShieldCheck className="w-5 h-5 flex-shrink-0" />;
    case 'AlertTriangle':
      return <AlertTriangle className="w-5 h-5 flex-shrink-0" />;
    case 'AlertCircle':
      return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
    case 'PieChart':
      return <PieChart className="w-5 h-5 flex-shrink-0" />;
    case 'Lightbulb':
      return <Lightbulb className="w-5 h-5 flex-shrink-0" />;
    case 'Sparkles':
      return <Sparkles className="w-5 h-5 flex-shrink-0" />;
    case 'Activity':
      return <Activity className="w-5 h-5 flex-shrink-0" />;
    default:
      return <Info className="w-5 h-5 flex-shrink-0" />;
  }
};

export const SmartInsightsCard: React.FC<SmartInsightsCardProps> = ({
  insights,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Insights Inteligentes</span>
            </CardTitle>
            <CardDescription>
              Recomendaciones y hallazgos automáticos basados en tus hábitos de consumo
            </CardDescription>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
            IA Financiera
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((item) => {
              const style = STYLE_MAP[item.type] || STYLE_MAP.info;

              return (
                <div
                  key={item.id}
                  className={cn(
                    'p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3',
                    style.container
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs',
                        style.iconBg
                      )}
                    >
                      {resolveInsightIcon(item.icon)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className={cn('text-sm font-bold truncate', style.title)}>
                          {item.title}
                        </h4>
                        <Badge
                          variant={style.badgeVariant}
                          size="sm"
                          className="flex-shrink-0"
                        >
                          {style.badgeLabel}
                        </Badge>
                      </div>
                      <p className={cn('text-xs leading-relaxed', style.description)}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
            <Sparkles className="w-6 h-6 mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">
              Sin insights disponibles
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Registra movimientos para generar recomendaciones personalizadas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
