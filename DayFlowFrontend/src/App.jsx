import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ROLES } from './utils/constants';

// Layouts
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { AdminRegisterPage } from './pages/auth/AdminRegisterPage';
import { SetupPasswordPage } from './pages/auth/SetupPasswordPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EmployeeListPage } from './pages/admin/EmployeeListPage';
import { EmployeeDetailPage } from './pages/admin/EmployeeDetailPage';
import { AttendanceManagementPage } from './pages/admin/AttendanceManagementPage';
import { LeaveManagementPage } from './pages/admin/LeaveManagementPage';
import { PayrollManagementPage } from './pages/admin/PayrollManagementPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { ProfilePage } from './pages/employee/ProfilePage';
import { AttendanceHistoryPage } from './pages/employee/AttendanceHistoryPage';
import { LeavePortalPage } from './pages/employee/LeavePortalPage';
import { MySalaryPage } from './pages/employee/MySalaryPage';
import { MyDocumentsPage } from './pages/employee/MyDocumentsPage';
import { CalendarPage } from './pages/employee/CalendarPage';
import { CompanyInfoPage } from './pages/employee/CompanyInfoPage';

// 404
import { NotFoundPage } from './pages/NotFoundPage';

// Root redirect handler
const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return user?.role === ROLES.ADMIN ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/employee" replace />
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-admin" element={<AdminRegisterPage />} />
          <Route path="/setup-password" element={<SetupPasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Protected Administrator Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<EmployeeListPage />} />
          <Route path="employees/:id" element={<EmployeeDetailPage />} />
          <Route path="attendance" element={<AttendanceManagementPage />} />
          <Route path="leaves" element={<LeaveManagementPage />} />
          <Route path="payroll" element={<PayrollManagementPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* Protected Employee Self-Service Routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={[ROLES.EMPLOYEE]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployeeDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="attendance" element={<AttendanceHistoryPage />} />
          <Route path="leaves" element={<LeavePortalPage />} />
          <Route path="salary" element={<MySalaryPage />} />
          <Route path="documents" element={<MyDocumentsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="company" element={<CompanyInfoPage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
