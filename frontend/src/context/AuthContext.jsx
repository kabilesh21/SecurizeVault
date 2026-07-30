import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user profile to verify token
      axios.get('/api/users/profile')
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          console.error("Token verification failed, logging out", err);
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (usernameOrEmail, password) => {
    try {
      const res = await axios.post('/api/auth/login', { usernameOrEmail, password });
      const { token: jwtToken, username, email, role } = res.data;
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser({ username, email, role });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      await axios.post('/api/auth/register', { username, email, password });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/auth/forgot-password', { email });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to submit password reset request.'
      };
    }
  };

  const resetPassword = async (email, newPassword) => {
    try {
      await axios.post('/api/auth/reset-password', { email, newPassword });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to reset password.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, forgotPassword, resetPassword, logout, isAuthenticated: !!user }}>
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
