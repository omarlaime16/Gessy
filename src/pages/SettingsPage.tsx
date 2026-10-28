import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, User, Globe } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <PageContainer
      title="Configuración"
      subtitle="Gestiona tus preferencias de apariencia y cuenta de usuario"
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle>Perfil de Usuario</CardTitle>
            </div>
            <CardDescription>
              Información vinculada a tu cuenta actual en Gessy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 py-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xl flex items-center justify-center shadow-sm">
                {(user?.full_name?.charAt(0) || 'U').toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {user?.full_name || 'Usuario Demo'}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {user?.email || 'usuario.demo@gessy.app'}
                </span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 inline-flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Moneda predeterminada: S/ (PEN Soles)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance / Dark Mode Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {isDark ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <CardTitle>Apariencia</CardTitle>
            </div>
            <CardDescription>
              Personaliza el tema visual para reducir el cansancio visual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Modo Oscuro
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Alterna entre la paleta clara y oscura inspirada en Fikio.
                </span>
              </div>
              <Toggle
                checked={isDark}
                onChange={toggleTheme}
                label=""
              />
            </div>
          </CardContent>
        </Card>

        {/* Account / Sign Out Card */}
        <Card className="border-rose-100 dark:border-rose-950/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-rose-500" />
              <CardTitle>Sesión</CardTitle>
            </div>
            <CardDescription>
              Cierra tu sesión activa de manera segura en este dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  ¿Deseas salir de tu cuenta?
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Podrás volver a ingresar en cualquier momento con tu cuenta de Google.
                </p>
              </div>
              <Button
                variant="danger"
                icon={LogOut}
                onClick={handleSignOut}
              >
                Cerrar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};
