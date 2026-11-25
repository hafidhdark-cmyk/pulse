import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pulse_token');
    if (token) {
      api.auth.getMe()
        .then(res => {
          setUser(res.user);
        })
        .catch(err => {
          console.error("Auth initialization error:", err);
          localStorage.removeItem('pulse_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (emailOrUsername, password) => {
    const res = await api.auth.login({ emailOrUsername, password });
    localStorage.setItem('pulse_token', res.token);
    setUser(res.user);
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    localStorage.setItem('pulse_token', res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('pulse_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
