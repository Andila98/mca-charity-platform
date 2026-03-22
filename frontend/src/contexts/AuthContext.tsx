import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

import {
  type User,
  type AdminUser,
  type AuthContextType,
  type RegisterFormData,
  type Permission,
  // These two are used as VALUES in your rolePermissions objects, 
  // so we import them as regular values (no 'type' prefix).
  UserRole,
  AdminRole,
} from '@/types/auth';
// import {
//   User,
//   AdminUser,
//   AuthContextType,
//   RegisterFormData,
//   UserRole,
//   AdminRole,
//   Permission,
// } from '@/types/auth';

const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
  });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient(import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1');

const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: ['create', 'edit', 'delete', 'manage_users', 'manage_admins', 'approve_users', 'manage_content', 'view_analytics'],
  [UserRole.EDITOR]: ['create', 'edit', 'manage_content', 'view_analytics'],
  [UserRole.VIEWER]: ['view_analytics'],
};

const adminRolePermissions: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: ['create', 'edit', 'delete', 'manage_users', 'manage_admins', 'approve_users', 'manage_content', 'view_analytics'],
  [AdminRole.ADMIN]: ['create', 'edit', 'delete', 'manage_users', 'approve_users', 'manage_content', 'view_analytics'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!(user || admin);
  const isAdmin = !!admin;

  useEffect(() => {
    const loadStoredAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      const storedAdmin = localStorage.getItem('admin');

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
      }
      setLoading(false);
    };
    loadStoredAuth();
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      if (rememberMe) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');
      setToken(token);
      setUser(userData);
      setAdmin(null);
      localStorage.removeItem('admin');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterFormData) => {
  setLoading(true);
  setError(null);
  try {
    // Remove confirmPassword and agreeTerms, keep role
    const { confirmPassword, agreeTerms, ...registrationData } = data;
    
    // Ensure role is included (defaults to VIEWER if not provided)
    const payload = {
      ...registrationData,
      role: registrationData.role || 'VIEWER',
    };
    
    console.log('Sending registration data:', payload);
    
    const response = await apiClient.post('/auth/register', payload);
    console.log('Registration response:', response.data);
    
    // Auto-login after successful registration
    await login(data.email, data.password);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('Registration error:', err.response?.data);
      // Extract detailed error message from backend
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          'Registration failed';
      setError(errorMessage);
    } else {
      setError('An unexpected error occurred');
    }
    throw err;
  } finally {
    setLoading(false);
  }
}, [login]);

  const adminLogin = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/admin/auth/login', { username, password });
      const { token, ...adminData } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('admin', JSON.stringify(adminData));
      setToken(token);
      setAdmin(adminData);
      setUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Admin login failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    setToken(null);
    setUser(null);
    setAdmin(null);
    setError(null);
  }, []);

  const hasRole = useCallback((roles: UserRole | UserRole[]) => {
    if (!user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  }, [user]);

  const hasAdminRole = useCallback((roles: AdminRole | AdminRole[]) => {
    if (!admin) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(admin.role);
  }, [admin]);

  const can = useCallback((permission: Permission): boolean => {
    if (admin) return adminRolePermissions[admin.role]?.includes(permission) || false;
    if (user) return rolePermissions[user.role]?.includes(permission) || false;
    return false;
  }, [user, admin]);

  const updateUser = useCallback(async (userData: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    try {
      const response = await apiClient.put(`/users/${user.id}`, userData);
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to update user');
      }
      throw err;
    }
  }, [user]);

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextType = {
    user, admin, token, isAuthenticated, isAdmin, loading, error,
    login, register, logout, adminLogin, hasRole, hasAdminRole, can, clearError, updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const useIsAuthenticated = () => useAuth().isAuthenticated;
export const useUserRole = () => useAuth().user?.role || null;
export const useAdminRole = () => useAuth().admin?.role || null;