import React, { createContext, useContext, useEffect, useState } from 'react';

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
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'gessy_auth_user';

export const MOCK_USER: AuthUser = {
  id: 'mock-user',
  full_name: 'Usuario Demo',
  avatar_url: null,
  currency: 'PEN',
  email: 'usuario.demo@gessy.app',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === null) {
        // Default to mock user on first run for immediate demo experience
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

  const signInWithGoogle = async () => {
    setIsLoading(true);
    // Simulate brief network delay for authentic feel
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
        signInWithGoogle,
        signOut,
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
