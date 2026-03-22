import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AdminLoginForm } from '@/components/auth/AdminLoginForm';
import { UserRole } from '@/types/auth';

// Layout Components
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50">
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <h1 className="text-xl font-bold text-primary">Charity Platform</h1>
        </div>
      </div>
    </nav>
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  </div>
);

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-100">
    <nav className="bg-gray-900 text-white shadow-sm sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
      </div>
    </nav>
    <main className="p-8">
      {children}
    </main>
  </div>
);

// Page Components (Placeholders - you can expand these)
const Dashboard = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <p className="text-muted-foreground">Welcome to your dashboard!</p>
  </div>
);

const Projects = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Projects</h1>
    <p className="text-muted-foreground">View and manage charity projects.</p>
  </div>
);

const Donations = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Donations</h1>
    <p className="text-muted-foreground">Track your donations and giving history.</p>
  </div>
);

const Events = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Events</h1>
    <p className="text-muted-foreground">Upcoming charity events and volunteering opportunities.</p>
  </div>
);

const Volunteers = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Volunteers</h1>
    <p className="text-muted-foreground">Manage volunteer activities and schedules.</p>
  </div>
);

const AdminDashboard = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
    <p className="text-muted-foreground">Welcome to the admin panel.</p>
  </div>
);

const UserManagement = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">User Management</h1>
    <p className="text-muted-foreground">Manage platform users and their roles.</p>
  </div>
);

const ContentManagement = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Content Management</h1>
    <p className="text-muted-foreground">Manage platform content and pages.</p>
  </div>
);

const Analytics = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Analytics</h1>
    <p className="text-muted-foreground">View platform analytics and reports.</p>
  </div>
);

const Settings = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <p className="text-muted-foreground">Configure platform settings.</p>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/admin/login" element={<AdminLoginForm />} />
          
          {/* User Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Projects />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/donations"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Donations />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Events />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteers"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Volunteers />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiresAdmin>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiresAdmin>
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <ProtectedRoute requiresAdmin>
                <AdminLayout>
                  <ContentManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requiresAdmin>
                <AdminLayout>
                  <Analytics />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiresAdmin>
                <AdminLayout>
                  <Settings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;