import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Target,
  type LucideIcon,
} from 'lucide-react';

interface NavItemConfig {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItemConfig[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { path: '/budgets', label: 'Presupuestos', icon: PieChart },
  { path: '/analysis', label: 'Análisis', icon: BarChart3 },
  { path: '/savings', label: 'Metas', icon: Target },
];

export const BottomNav: React.FC = () => {
  return (
    <nav
      aria-label="Navegación móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 pb-safe"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `tap-effect relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all duration-150 rounded-xl ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-150 ${
                        isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                      }`}
                    />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[11px] mt-1 tracking-tight leading-none">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
