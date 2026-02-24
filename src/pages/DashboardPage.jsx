import { AlertCircle } from 'lucide-react'
import Button from '../components/Button'
import { useAppContext } from '../hooks/useAppContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import UpcomingAppointmentsWidget from '../components/widgets/UpcomingAppointmentsWidget'
import HealthVitalsWidget from '../components/widgets/HealthVitalsWidget'
import NotificationsWidget from '../components/widgets/NotificationsWidget'

export default function DashboardPage() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const {
    appointments = [],
    healthVitals = [],
    notifications = [],
    loadingStates = {},
    errorStates = {},
    fetchAppointments,
    fetchVitals,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    notificationLoadingId,
    markAllLoading,
  } = useAppContext()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">
            Welcome back, {role === 'patient' ? 'Patient' : 'User'}
          </h1>
          <p className="text-slate-500">Here's your health overview for today.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/book')}>Book New Appointment</Button>
        </div>
      </div>

      <HealthVitalsWidget
        vitals={healthVitals}
        loading={loadingStates.vitals}
        error={errorStates.vitals}
        onRetry={fetchVitals}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingAppointmentsWidget
            appointments={appointments}
            loading={loadingStates.appointments}
            error={errorStates.appointments}
            onRetry={fetchAppointments}
            onViewAll={() => navigate('/appointments')}
            onBookNow={() => navigate('/book')}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
          <NotificationsWidget
            notifications={notifications}
            loading={loadingStates.notifications}
            error={errorStates.notifications}
            onRetry={fetchNotifications}
            onMarkRead={markNotificationRead}
            onMarkAll={markAllNotificationsRead}
            notificationLoadingId={notificationLoadingId}
            markAllLoading={markAllLoading}
          />

          <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white border-none shadow-lg shadow-primary/20 relative overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-lg">Did you know?</h3>
              </div>
              <p className="text-sm text-white/90 leading-relaxed font-medium">
                Regular check-ups can detect health issues early when they're most treatable. Schedule your annual physical today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

