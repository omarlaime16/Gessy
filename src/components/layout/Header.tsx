import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user } = useAuth();

  const firstName = user?.full_name ? user.full_name.trim().split(' ')[0] : 'Usuario';
  const initial = firstName.charAt(0).toUpperCase() || 'U';

  const now = new Date();
  const monthName = now.toLocaleDateString('es-PE', { month: 'long' });
  const formattedMonthYear = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${now.getFullYear()}`;

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/30 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Greeting */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-inner shadow-white/20 group-hover:scale-105 transition-transform duration-150">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
              Gessy
            </span>
          </Link>

          <div className="hidden sm:block h-6 w-px bg-indigo-800/60 mx-1" />

          {/* Saludo & Fecha */}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white/95 leading-none">
              Hola, {firstName}
            </span>
            <span className="text-xs text-indigo-300/90 font-medium mt-0.5 leading-none">
              {formattedMonthYear}
            </span>
          </div>
        </div>

        {/* Right: Actions & User Avatar */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <Link
            to="/settings"
            title="Configuración"
            className="tap-effect p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <Settings className="w-5 h-5" />
          </Link>

          <Link
            to="/settings"
            className="tap-effect flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-400 rounded-full"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={firstName}
                className="w-9 h-9 rounded-full ring-2 ring-indigo-400/40 object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 ring-2 ring-indigo-400/40 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                {initial}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
