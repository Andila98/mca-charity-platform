import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, AdminRole, Permission } from '@/types/auth';

export const useRequireRole = (requiredRoles: UserRole | UserRole[]) => {
  const { user, loading, hasRole } = useAuth();
  const navigate = useNavigate();

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const hasRequiredRole = user ? hasRole(roles) : false;

  useEffect(() => {
    if (!loading && !hasRequiredRole && user) {
      navigate('/dashboard');
    }
  }, [loading, hasRequiredRole, user, navigate]);

  return { hasRequiredRole, loading };
};

export const useRequireAdmin = () => {
  const { admin, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [loading, isAdmin, navigate]);

  return { isAdmin, loading };
};

export const usePermissions = () => {
  const { can } = useAuth();

  return {
    canCreate: () => can('create'),
    canEdit: () => can('edit'),
    canDelete: () => can('delete'),
    canManageUsers: () => can('manage_users'),
    canManageAdmins: () => can('manage_admins'),
    canApproveUsers: () => can('approve_users'),
    canManageContent: () => can('manage_content'),
    canViewAnalytics: () => can('view_analytics'),
  };
};

export const useLogoutWithConfirmation = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const logoutWithConfirm = useCallback(() => {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (confirmed) {
      logout();
      navigate('/login');
    }
  }, [logout, navigate]);

  return logoutWithConfirm;
};

export const useAuthErrorHandler = () => {
  const { error, clearError } = useAuth();

  return {
    error,
    clearError,
    hasError: !!error,
  };
};

export const useTokenRefresh = (intervalMinutes: number = 30) => {
  const { token } = useAuth();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, intervalMinutes]);

  return { lastRefresh };
};

export const useUnsavedChangesWarning = (hasUnsaved: boolean) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsaved && isAuthenticated) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsaved, isAuthenticated]);

  const navigate = useNavigate();
  const originalNavigate = navigate;

  const checkUnsavedChanges = useCallback((to: string) => {
    if (hasUnsaved) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) {
        return false;
      }
    }
    originalNavigate(to);
    return true;
  }, [hasUnsaved, originalNavigate]);

  return { checkUnsavedChanges };
};

export const useAuthStateListener = (onAuthChange: (isAuthenticated: boolean, user?: any) => void) => {
  const { isAuthenticated, user, admin } = useAuth();

  useEffect(() => {
    onAuthChange(isAuthenticated, user || admin);
  }, [isAuthenticated, user, admin, onAuthChange]);
};

export const useSessionTimeout = (timeoutMinutes: number = 30) => {
  const { logout, isAuthenticated } = useAuth();
  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => setLastActivity(new Date());
    
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
      
      if (diff >= timeoutMinutes) {
        logout();
        window.location.href = '/login?session=expired';
      }
    }, 60000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      clearInterval(interval);
    };
  }, [isAuthenticated, logout, timeoutMinutes, lastActivity]);

  return { lastActivity };
};