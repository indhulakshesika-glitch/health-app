import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('health-user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('health-token') || '');

  useEffect(() => {
    if (user) localStorage.setItem('health-user', JSON.stringify(user));
    else localStorage.removeItem('health-user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('health-token', token);
    else localStorage.removeItem('health-token');
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    delete api.defaults.headers.common.Authorization;
  };

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
