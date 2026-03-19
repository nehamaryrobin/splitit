import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session via stored access token
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('accessToken'))
      .finally(() => setLoading(false));
  }, []);

  // Called by OAuthCallback after storing token in localStorage
  const fetchMe = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    sessionStorage.removeItem('splitit_guest'); // ← add this
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('accessToken', data.accessToken);
  sessionStorage.removeItem('splitit_guest'); // ← add this
  setUser(data.user);
  return data.user;
}, []);

const register = useCallback(async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  localStorage.setItem('accessToken', data.accessToken);
  sessionStorage.removeItem('splitit_guest'); 
  setUser(data.user);
  return data.user;
}, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('splitit_guest'); // added myself
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
