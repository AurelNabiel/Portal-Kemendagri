'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';

const TOKEN_KEY = 'portal-auth-token:v1';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const clear = useCallback(() => {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch {}
    setToken(null);
    setUser(null);
  }, []);

  const loadMe = useCallback(async (authToken) => {
    const data = await apiFetch('/auth/me', { token: authToken });
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    let saved = null;
    try { saved = sessionStorage.getItem(TOKEN_KEY); } catch {}
    if (!saved) { setReady(true); return; }
    setToken(saved);
    loadMe(saved).catch(clear).finally(() => setReady(true));
  }, [clear, loadMe]);

  const login = useCallback(async (username, password) => {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { username, password } });
    try { sessionStorage.setItem(TOKEN_KEY, data.token); } catch {}
    setToken(data.token);
    const me = await loadMe(data.token);
    return me;
  }, [loadMe]);

  const logout = useCallback(async () => {
    try { if (token) await apiFetch('/auth/logout', { method: 'POST', token }); } catch {}
    clear();
  }, [token, clear]);

  const can = useCallback((permission) => user?.permissions?.includes(permission) || false, [user]);

  const value = useMemo(() => ({ token, user, ready, login, logout, can, refreshUser: () => token && loadMe(token) }), [token, user, ready, login, logout, can, loadMe]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth harus digunakan di dalam <AuthProvider>');
  return value;
}
