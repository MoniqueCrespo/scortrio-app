'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, User } from '@/lib/api';

// Tipos
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  nome: string;
  email: string;
  password: string;
  whatsapp?: string;
}

// Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Carregar token do localStorage ao iniciar
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const savedToken = localStorage.getItem('scortrio_token');
        
        if (savedToken) {
          setToken(savedToken);
          
          // Verificar se o token ainda é válido
          const userData = await api.auth.me(savedToken);
          
          if (userData.id) {
            setUser(userData);
          } else {
            // Token inválido, limpar
            localStorage.removeItem('scortrio_token');
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar autenticação:', error);
        localStorage.removeItem('scortrio_token');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  // Atualizar dados do usuário
  const refreshUser = useCallback(async () => {
    if (!token) return;
    
    try {
      const userData = await api.auth.me(token);
      if (userData.id) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  }, [token]);

  // Login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await api.auth.login(email, password);
      
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('scortrio_token', response.token);
        
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Erro ao fazer login' };
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message || 'Erro ao fazer login' };
    } finally {
      setIsLoading(false);
    }
  };

  // Registro
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      
      const response = await api.auth.register(data);
      
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('scortrio_token', response.token);
        
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Erro ao criar conta' };
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return { success: false, error: error.message || 'Erro ao criar conta' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('scortrio_token');
    router.push('/');
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}
