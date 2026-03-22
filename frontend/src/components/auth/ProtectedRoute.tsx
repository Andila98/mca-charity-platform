import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, AdminRole } from '@/types/auth';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: (UserRole | AdminRole)[];
  requiresAdmin?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiresAdmin = false,
  fallbackPath = '/login',
}) => {
  const { isAuthenticated, user, admin, loading, hasRole, hasAdminRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (requiresAdmin && !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              This area is restricted to administrators only. If you believe you should have access,
              please contact your system administrator.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (requiredRoles && requiredRoles.length > 0) {
    let hasRequiredRole = false;

    if (user && requiredRoles.some(role => Object.values(UserRole).includes(role as UserRole))) {
      hasRequiredRole = hasRole(requiredRoles as UserRole[]);
    }

    if (admin && requiredRoles.some(role => Object.values(AdminRole).includes(role as AdminRole))) {
      hasRequiredRole = hasAdminRole(requiredRoles as AdminRole[]);
    }

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <ShieldAlert className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Insufficient Permissions</CardTitle>
              <CardDescription>
                You don't have the required role to access this page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">
                Required role: {requiredRoles.join(', ')}<br />
                Your role: {user?.role || admin?.role}
              </p>
            </CardContent>
            <CardFooter className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
};