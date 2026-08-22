import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('dayflow_token');
      const savedUser = localStorage.getItem('dayflow_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to parse saved auth state:', e);
      localStorage.removeItem('dayflow_token');
      localStorage.removeItem('dayflow_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (authToken, authUserData) => {
    setToken(authToken);
    setUser(authUserData);
    localStorage.setItem('dayflow_token', authToken);
    localStorage.setItem('dayflow_user', JSON.stringify(authUserData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('dayflow_token');
    localStorage.removeItem('dayflow_user');
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('dayflow_user', JSON.stringify(updated));
      return updated;
    });
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isEmployee = user?.role === ROLES.EMPLOYEE;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isEmployee,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
