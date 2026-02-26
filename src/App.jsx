import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BookPage from './pages/BookPage'
import QueuePage from './pages/QueuePage'
import DoctorPage from './pages/DoctorPage'
import ClinicDetailsPage from './pages/ClinicDetailsPage'
import ClinicHoursSettingsPage from './pages/ClinicHoursSettingsPage'
import DoctorAvailabilitySettingsPage from './pages/DoctorAvailabilitySettingsPage'

function AuthenticatedLayout({ allowedRoles }) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<AuthenticatedLayout allowedRoles={['patient']} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/book" element={<BookPage />} />
                <Route path="/clinic/:id" element={<ClinicDetailsPage />} />
              </Route>
              <Route element={<AuthenticatedLayout allowedRoles={['reception', 'patient']} />}>
                <Route path="/queue" element={<QueuePage />} />
              </Route>
              <Route element={<AuthenticatedLayout allowedRoles={['reception']} />}>
                <Route path="/settings/clinic-hours" element={<ClinicHoursSettingsPage />} />
              </Route>
              <Route element={<AuthenticatedLayout allowedRoles={['doctor']} />}>
                <Route path="/settings/doctor-availability" element={<DoctorAvailabilitySettingsPage />} />
                <Route path="/doctor" element={<DoctorPage />} />
              </Route>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
