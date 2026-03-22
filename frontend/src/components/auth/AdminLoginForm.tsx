import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLoginSchema,type AdminLoginFormData } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminLoginFormProps {
  onSuccess?: () => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { login, adminLogin, error, clearError, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'admin' | 'user'>('admin');

  const form = useForm<AdminLoginFormData>({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: {
      username: '',
      password: '',
      mode: 'admin',
    },
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    clearError();
    try {
      if (data.mode === 'admin') {
        await adminLogin(data.username, data.password);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        await login(data.username, data.password);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleModeChange = (value: string) => {
    const newMode = value as 'admin' | 'user';
    setMode(newMode);
    form.setValue('mode', newMode);
    form.setValue('username', '');
    form.setValue('password', '');
    clearError();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-2">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          Authentication Portal
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to access your account
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="admin" onValueChange={handleModeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="admin">Admin Access</TabsTrigger>
            <TabsTrigger value="user">User Access</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TabsContent value="admin">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin_username" 
                          autoComplete="username"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="user">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="you@example.com" 
                          type="email"
                          autoComplete="email"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="••••••" 
                          type={showPassword ? 'text' : 'password'}
                          autoComplete={mode === 'admin' ? 'current-password' : 'current-password'}
                          disabled={loading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {mode === 'user' && (
                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 font-normal"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Forgot password?
                  </Button>
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'admin' ? 'Sign in as Admin' : 'Sign in as User'}
              </Button>
            </form>
          </Form>
        </Tabs>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="font-semibold">Info:</strong> Admin accounts use username/password authentication.
            Regular users use email/password authentication. Select the appropriate tab for your account type.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};