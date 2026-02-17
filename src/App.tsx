import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Layouts
import MainLayout from '@/layouts/MainLayout'
import AdminLayout from '@/layouts/AdminLayout'
import AuthLayout from '@/layouts/AuthLayout'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import CompanySetupPage from '@/pages/auth/CompanySetupPage'
import AdminLoginPage from '@/pages/auth/AdminLoginPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

// Main pages
import DashboardPage from '@/pages/main/DashboardPage'
import DeclarationsPage from '@/pages/main/DeclarationsPage'
import DeclarationDetailPage from '@/pages/main/DeclarationDetailPage'
import CertificatesPage from '@/pages/main/CertificatesPage'
import CertificateDetailPage from '@/pages/main/CertificateDetailPage'
import TasksPage from '@/pages/main/TasksPage'
import TaskDetailPage from '@/pages/main/TaskDetailPage'
import DocumentsPage from '@/pages/main/DocumentsPage'
import ClientsPage from '@/pages/main/ClientsPage'
import ClientDetailPage from '@/pages/main/ClientDetailPage'
import PartnershipsPage from '@/pages/main/PartnershipsPage'
import EmployeesPage from '@/pages/main/EmployeesPage'
import RequestsPage from '@/pages/main/RequestsPage'
import SettingsPage from '@/pages/main/SettingsPage'

// Admin pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminCompaniesPage from '@/pages/admin/AdminCompaniesPage'
import AdminCompanyDetailPage from '@/pages/admin/AdminCompanyDetailPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminUserDetailPage from '@/pages/admin/AdminUserDetailPage'
import AdminRequestsPage from '@/pages/admin/AdminRequestsPage'

// Guards
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminRoute from '@/components/AdminRoute'

function App() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/company-setup" element={<CompanySetupPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Main app routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/declarations" element={<DeclarationsPage />} />
          <Route path="/declarations/:id" element={<DeclarationDetailPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/certificates/:id" element={<CertificateDetailPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route path="/partnerships" element={<PartnershipsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/companies" element={<AdminCompaniesPage />} />
          <Route path="/admin/companies/:id" element={<AdminCompanyDetailPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
          <Route path="/admin/requests" element={<AdminRequestsPage />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App