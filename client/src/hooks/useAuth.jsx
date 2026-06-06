import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { uploadApi } from '../utils/api.js';

const AuthContext = createContext(null);

function setToken(token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  uploadApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function clearToken() {
  delete api.defaults.headers.common['Authorization'];
  delete uploadApi.defaults.headers.common['Authorization'];
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setToken(token);
      api.get('/auth/me')
        .then(res => setAdmin(res.data))
        .catch(err => {
          // Only discard token on 401 Unauthorized — not on network/server errors
          if (err.response?.status === 401) {
            localStorage.removeItem('adminToken');
            clearToken();
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token, admin } = res.data;
    localStorage.setItem('adminToken', token);
    setToken(token);
    setAdmin(admin);
    return admin;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    clearToken();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
