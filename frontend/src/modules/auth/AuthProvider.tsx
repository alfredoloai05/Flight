import { createContext, useContext, useEffect, useState } from 'react';
import { http, setAccessToken } from '../api/http';
import type { LoginResp, MeResp } from './types';

type Ctx = {
  user: MeResp | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<Ctx>({} as any);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeResp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const at = localStorage.getItem('accessToken');
      if (at) setAccessToken(at);
      try {
        const me = await http.get('/auth/me/');
        setUser(me as MeResp);
      } catch {
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(username: string, password: string) {
    const tokens = (await http.post('/auth/login/', { username, password })) as LoginResp;
    setAccessToken(tokens.access);
    const me = (await http.get('/auth/me/')) as MeResp;
    setUser(me);
  }
  function logout() {
    setAccessToken(null);
    setUser(null);
  }

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
}
