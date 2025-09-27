import { createContext, useContext, useEffect, useState } from 'react';
import { http } from '../api/http';
import type { UserInfo } from './types';

type AuthCtx = {
  user: UserInfo | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: 'operator' | 'admin') => boolean;
};

const Ctx = createContext<AuthCtx>(null as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const { data } = await http.get<UserInfo>('/auth/me/');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) fetchMe();
    else setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    const { data } = await http.post('/auth/login/', { username, password });
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    await fetchMe();
  }

  function logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    window.location.href = '/login';
  }

  function hasRole(role: 'operator' | 'admin') {
    if (!user) return false;
    if (role === 'admin') return user.is_superuser;
    if (role === 'operator') return user.is_staff || user.is_superuser;
    return false;
  }

  return <Ctx.Provider value={{ user, loading, login, logout, hasRole }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
