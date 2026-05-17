import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import ErrorBoundary from './components/common/ErrorBoundary'
import NavBar from './components/common/NavBar'
import Footer from './components/common/Footer'
import AdminLayout from './pages/admin/AdminLayout'

import HomePage from './pages/HomePage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import EventsPage from './pages/EventsPage'
import DonatePage from './pages/DonatePage'
import VolunteersPage from './pages/VolunteersPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

import AdminLoginPage from './pages/admin/AdminLoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import UsersPage from './pages/admin/UsersPage'
import ProjectsAdminPage from './pages/admin/ProjectsPage'
import DonationsPage from './pages/admin/DonationsPage'
import EventsAdminPage from './pages/admin/EventsPage'
import VolunteersAdminPage from './pages/admin/VolunteersPage'
import ContentPage from './pages/admin/ContentPage'
import ImagesPage from './pages/admin/ImagesPage'
import ActivityPage from './pages/admin/ActivityPage'
import SettingsPage from './pages/admin/SettingsPage'

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/projects" element={<PublicLayout><ProjectsPage /></PublicLayout>} />
        <Route path="/projects/:id" element={<PublicLayout><ProjectDetailPage /></PublicLayout>} />
        <Route path="/events" element={<PublicLayout><EventsPage /></PublicLayout>} />
        <Route path="/donate" element={<PublicLayout><DonatePage /></PublicLayout>} />
        <Route path="/volunteers" element={<PublicLayout><VolunteersPage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin protected routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="projects" element={<ProjectsAdminPage />} />
          <Route path="donations" element={<DonationsPage />} />
          <Route path="events" element={<EventsAdminPage />} />
          <Route path="volunteers" element={<VolunteersAdminPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="images" element={<ImagesPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      </ErrorBoundary>
      <ToastContainer position="bottom-right" autoClose={4000} />
    </>
  )
}
