import React, { createContext, useContext, useEffect, useState } from 'react';
import { Usuario } from '../types';
import { requestApi } from '../services/api';

interface AuthContextType {
  user: Usuario | null;
  token: null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    requestApi<Usuario>('/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setIsLoading(false));
    const handleLogout = () => setUser(null);
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  const login = async (email: string, senha: string) => {
    const data = await requestApi<{ usuario: Usuario }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
    setUser(data.usuario);
  };

  const logout = () => {
    void requestApi('/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token: null, isAuthenticated: !!user, isLoading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
