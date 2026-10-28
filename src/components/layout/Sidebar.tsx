import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Target,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: SidebarNavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { path: '/budgets', label: 'Presupuestos', icon: PieChart },
  { path: '/analysis', label: 'Análisis', icon: BarChart3 },
  { path: '/savings', label: 'Metas de Ahorro', icon: Target },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.full_name || 'Usuario Demo';
  const userInitial = userName.charAt(0).toUpperCase() || 'U';

  return (
    <aside
      aria-label="Barra lateral"
      className="hidden md:flex flex-col w-64 shrink-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-r border-indigo-900/30 text-white min-h-screen sticky top-0 h-screen select-none z-30"
    >
      {/* Top Branding */}
      <div className="h-16 flex items-center px-6 border-b border-indigo-900/30">
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-inner shadow-white/20 group-hover:scale-105 transition-transform duration-150">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
              Gessy
            </span>
            <span className="text-[11px] text-indigo-300 font-medium tracking-wide">
              Finanzas Personales
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-300/60">
          Principal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `tap-effect group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 transition-transform duration-150 ${
                      isActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.8] group-hover:scale-105'
                    }`}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Settings Footer */}
      <div className="p-3 border-t border-indigo-900/30">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `tap-effect flex items-center justify-between p-2.5 rounded-xl transition-all duration-150 group ${
              isActive
                ? 'bg-white/15 text-white'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`
          }
        >
          <div className="flex items-center space-x-3 min-w-0">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={userName}
                className="w-9 h-9 rounded-full ring-2 ring-indigo-400/30 object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 ring-2 ring-indigo-400/30 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                {userInitial}
              </div>
            )}
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-sm font-semibold truncate text-white leading-tight">
                {userName}
              </span>
              <span className="text-xs text-indigo-300/80 truncate leading-tight mt-0.5">
                {user?.currency || 'PEN'} · S/ Soles
              </span>
            </div>
          </div>
          <Settings className="w-4 h-4 text-indigo-300 group-hover:text-white transition-colors shrink-0 ml-1" />
        </NavLink>
      </div>
    </aside>
  );
};
