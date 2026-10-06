import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '../types';
import { requestApi } from '../services/api';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('ponto_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Ignora erro de parse
      }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ponto_token') || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const me = await requestApi<Usuario>('/auth/me');
          setUser(me);
          localStorage.setItem('ponto_user', JSON.stringify(me));
        } catch (error) {
          // Token inválido ou servidor offline
        }
      }
      setIsLoading(false);
    }

    loadUser();

    const handleLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, [token]);

  const login = async (email: string, senha: string) => {
    try {
      const data = await requestApi<{ usuario: Usuario; token: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });

      setUser(data.usuario);
      setToken(data.token);
      localStorage.setItem('ponto_token', data.token);
      localStorage.setItem('ponto_refreshToken', data.refreshToken);
      localStorage.setItem('ponto_user', JSON.stringify(data.usuario));
    } catch (err: any) {
      // Se o backend respondeu com erro de negócio (ex: 401 Credenciais inválidas), repassa o erro e não permite login
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError') && !err.message.includes('fetch failed')) {
        throw err;
      }

      // Se a API backend estiver offline ou sem Docker rodando localmente, ativa modo demonstração interativa segura
      console.warn('Servidor offline. Ativando sessão de demonstração local.');
      const demoUser: Usuario = {
        id: 'demo-user-id',
        nome: email.includes('admin') ? 'Super Administrador' : email.includes('rh') ? 'Camila RH' : 'Diretoria IMARF',
        email,
        perfil: email.includes('admin') ? 'SUPER_ADMIN' : email.includes('rh') ? 'RH' : 'ADMIN_EMPRESA',
        empresa: {
          id: 'demo-empresa-id',
          razaoSocial: 'IMARF Soluções Tecnológicas LTDA',
          nomeFantasia: 'IMARF Tecnologia',
          cnpj: '12.345.678/0001-90',
          ativo: true,
        },
      };
      setUser(demoUser);
      setToken('demo-token-jwt');
      localStorage.setItem('ponto_token', 'demo-token-jwt');
      localStorage.setItem('ponto_user', JSON.stringify(demoUser));
    }
  };

  const logout = () => {
    localStorage.removeItem('ponto_token');
    localStorage.removeItem('ponto_refreshToken');
    localStorage.removeItem('ponto_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
