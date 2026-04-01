import { createContext, useState, useContext, useEffect } from 'react';
import { superAdminAPI } from '../services/api';

const SuperAdminAuthContext = createContext(null);

export const SuperAdminAuthProvider = ({ children }) => {
  const [superAdmin, setSuperAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('superAdminToken');
      const saved = localStorage.getItem('superAdminUser');

      if (token && saved) {
        try {
          const res = await superAdminAPI.getMe();
          const data = res.data.data;
          setSuperAdmin(data);
          setIsAuthenticated(true);
          localStorage.setItem('superAdminUser', JSON.stringify(data));
        } catch {
          localStorage.removeItem('superAdminToken');
          localStorage.removeItem('superAdminUser');
          setSuperAdmin(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await superAdminAPI.login({ email, password });
      const { token, data } = res.data;
      localStorage.setItem('superAdminToken', token);
      localStorage.setItem('superAdminUser', JSON.stringify(data.user));
      setSuperAdmin(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminUser');
    setSuperAdmin(null);
    setIsAuthenticated(false);
  };

  return (
    <SuperAdminAuthContext.Provider value={{ superAdmin, loading, isAuthenticated, login, logout }}>
      {children}
    </SuperAdminAuthContext.Provider>
  );
};

export const useSuperAdminAuth = () => {
  const ctx = useContext(SuperAdminAuthContext);
  if (!ctx) throw new Error('useSuperAdminAuth must be used inside SuperAdminAuthProvider');
  return ctx;
};

export default SuperAdminAuthContext;