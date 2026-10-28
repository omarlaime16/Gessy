import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  WalletCards,
  TrendingUp,
  Loader2,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const {
    isAuthenticated,
    signInWithGoogle,
    isLoading,
    googleClientId,
    setGoogleClientId,
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempClientId, setTempClientId] = useState(googleClientId || '');
  const navigate = useNavigate();

  // If already authenticated, redirect directly to dashboard
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render Google button if Google GSI is available and client ID is set
  useEffect(() => {
    if (!googleClientId || typeof window === 'undefined') return;

    const interval = setInterval(() => {
      const container = document.getElementById('google-btn-container');
      if (window.google?.accounts?.id && container) {
        clearInterval(interval);
        try {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 320,
          });
        } catch (e) {
          console.warn('Google button render warning:', e);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [googleClientId]);

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
      if (!googleClientId) {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Error logging in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempClientId.trim()) {
      setGoogleClientId(tempClientId.trim());
      setIsKeyModalOpen(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Decorative blurred background ambient glow circles */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/40 text-center">
          {/* Logo / Icon Area */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 p-0.5 shadow-lg shadow-indigo-500/40 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900/40 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
                  <span className="text-3xl" role="img" aria-label="Dinero">
                    💰
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Title & Tagline */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Gessy
          </h1>
          <p className="text-indigo-300 font-medium text-base mt-2">
            Tu dinero bajo control
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-2 my-8 text-left">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
              <WalletCards className="w-5 h-5 text-indigo-300 mb-1" />
              <span className="text-[11px] text-slate-300 font-medium">Presupuestos</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
              <TrendingUp className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-[11px] text-slate-300 font-medium">Análisis</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
              <ShieldCheck className="w-5 h-5 text-indigo-300 mb-1" />
              <span className="text-[11px] text-slate-300 font-medium">Metas</span>
            </div>
          </div>

          {/* Google Sign-In Area */}
          <div className="space-y-3">
            {googleClientId ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <div id="google-btn-container" className="flex justify-center min-h-[44px]" />
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="text-xs text-indigo-300/80 hover:text-white transition-colors"
                >
                  O entrar como Usuario Demo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting || isLoading}
                className="tap-effect w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-black/20 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            )}

            {/* Configure Google Client ID Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-300/80 hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-white/5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>
                  {googleClientId
                    ? 'Google Client ID conectado'
                    : 'Conectar tu Google Client ID'}
                </span>
                {googleClientId && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                )}
              </button>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-xs text-indigo-200/70 mt-6 leading-relaxed">
            Gestiona tus finanzas de forma inteligente · Seguro y Privado
          </p>
        </div>
      </div>

      {/* Modal to configure Google Client ID */}
      <Modal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        title="Conectar Google Client ID"
      >
        <form onSubmit={handleSaveClientId} className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Ingresa tu <strong>Google Client ID</strong> de Google Cloud Console
            para vincular tus inicios de sesión con tu cuenta de Google real.
          </p>

          <Input
            label="Google Client ID"
            placeholder="123456789-xxxxxx.apps.googleusercontent.com"
            value={tempClientId}
            onChange={(e) => setTempClientId(e.target.value)}
            required
          />

          <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            💡 <strong>Nota:</strong> En Google Cloud Console, asegúrate de
            agregar en <em>"Orígenes de JavaScript autorizados"</em> tu dominio
            de Vercel (ej: <code>https://gessy-....vercel.app</code>) y{' '}
            <code>http://localhost:3000</code>.
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setIsKeyModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Guardar Client ID
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
