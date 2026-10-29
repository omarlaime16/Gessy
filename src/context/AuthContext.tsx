import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

export interface AuthUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  currency: string;
  email?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  googleClientId: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setGoogleClientId: (id: string) => void;
}

const AUTH_STORAGE_KEY = 'gessy_auth_user';
const GOOGLE_CLIENT_ID_KEY = 'gessy_google_client_id';
export const DEFAULT_GOOGLE_CLIENT_ID = '278063786282-qhstb3h9l0toun0dnmb3rsooc7b72ib1.apps.googleusercontent.com';

export const MOCK_USER: AuthUser = {
  id: 'mock-user',
  full_name: 'Usuario Demo',
  avatar_url: null,
  currency: 'PEN',
  email: 'usuario.demo@gessy.app',
};

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Error decoding Google JWT token:', err);
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [googleClientId, setGoogleClientIdState] = useState<string | null>(() => {
    return (
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      (typeof window !== 'undefined' ? localStorage.getItem(GOOGLE_CLIENT_ID_KEY) : null) ||
      DEFAULT_GOOGLE_CLIENT_ID
    );
  });

  const handleGoogleCredentialResponse = useCallback((response: any) => {
    if (!response?.credential) return;
    const payload = parseJwt(response.credential);
    if (payload) {
      const realUser: AuthUser = {
        id: payload.sub || `google-${Date.now()}`,
        full_name: payload.name || payload.given_name || 'Usuario Google',
        avatar_url: payload.picture || null,
        email: payload.email || '',
        currency: 'PEN',
      };
      setUser(realUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(realUser));
    }
  }, []);

  // Initialize Google Identity Services when Client ID is available
  useEffect(() => {
    if (!googleClientId || typeof window === 'undefined') return;

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(interval);
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
          });
        } catch (e) {
          console.warn('Google GSI initialization warning:', e);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [googleClientId, handleGoogleCredentialResponse]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === null) {
        setUser(MOCK_USER);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(MOCK_USER));
      } else if (stored === 'null' || stored === '') {
        setUser(null);
      } else {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {
      setUser(MOCK_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setGoogleClientId = (clientId: string) => {
    const cleanId = clientId.trim();
    setGoogleClientIdState(cleanId);
    localStorage.setItem(GOOGLE_CLIENT_ID_KEY, cleanId);
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);

    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google prompt not displayed, fallback to demo/button');
          }
        });
        setIsLoading(false);
        return;
      } catch (err) {
        console.error('Google Sign In error:', err);
      }
    }

    // Default simulation if no client ID is set yet
    await new Promise((resolve) => setTimeout(resolve, 500));
    setUser(MOCK_USER);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(MOCK_USER));
    setIsLoading(false);
  };

  const signOut = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    setUser(null);
    localStorage.setItem(AUTH_STORAGE_KEY, 'null');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        googleClientId,
        signInWithGoogle,
        signOut,
        setGoogleClientId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
