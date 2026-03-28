import { Activity, Bell, Calendar, ChevronRight, Clock, Sparkles, TrendingUp } from 'lucide-react'
import { useAppContext } from '../hooks/useAppContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import UpcomingAppointmentsWidget from '../components/widgets/UpcomingAppointmentsWidget'
import HealthVitalsWidget from '../components/widgets/HealthVitalsWidget'
import NotificationsWidget from '../components/widgets/NotificationsWidget'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getGreeting(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { role, user } = useAuth()
  const navigate = useNavigate()
  const {
    appointments = [],
    healthVitals = [],
    notifications = [],
    loadingStates = {},
    errorStates = {},
    fetchAppointments,
    fetchVitals,
    addVital,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    notificationLoadingId,
    markAllLoading,
  } = useAppContext()

  const now = new Date()
  const displayName = user?.name || user?.firstName || (role === 'patient' ? 'Patient' : role === 'doctor' ? 'Doctor' : 'User')
  const dateStr = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`
  const unreadCount = notifications.filter((n) => !n.read).length

  const quickStats = [
    { label: 'Appointments', value: appointments.length, sub: 'upcoming', icon: Calendar, color: 'text-primary', bg: 'bg-sky-50', onClick: () => navigate('/book') },
    { label: 'Notifications', value: unreadCount, sub: 'unread', icon: Bell, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Vitals', value: healthVitals.length, sub: 'metrics tracked', icon: Activity, color: 'text-accent', bg: 'bg-teal-50' },
    { label: 'Queue', value: '—', sub: 'check status', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', onClick: () => navigate('/queue') },
  ]

  return (
    <div className="space-y-8">

      {/* ── Hero Header ─────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden px-8 py-10 md:px-12 md:py-12"
        style={{ background: 'linear-gradient(135deg, #0b74ff 0%, #0546d0 60%, #14b8a6 100%)' }}
      >
        {/* Subtle geometric shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute top-1/2 right-12 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{dateStr}</p>
            <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
              {getGreeting(now.getHours())}, <span className="text-white/90">{displayName}</span>
            </h1>
            <p className="text-sm text-white/70">Here's your health overview for today.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/book')}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <Calendar className="h-4 w-4" />
              Book Appointment
            </button>
            <button
              type="button"
              onClick={() => navigate('/queue')}
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <Clock className="h-4 w-4" />
              Queue Status
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Stats Row ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={stat.onClick}
            className={`bg-white rounded-2xl p-5 text-left shadow-sm transition-all duration-200 ${stat.onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : 'cursor-default'}`}
          >
            <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-400">{stat.label}</p>
            <p className="text-[11px] text-slate-400">{stat.sub}</p>
          </button>
        ))}
      </div>

      {/* ── Health Vitals ────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-slate-800">Health Vitals</h2>
          <span className="text-xs font-medium text-primary cursor-pointer hover:underline flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> View trends
          </span>
        </div>
        <HealthVitalsWidget
          vitals={healthVitals}
          loading={loadingStates.vitals}
          error={errorStates.vitals}
          onRetry={fetchVitals}
          onAdd={addVital}
        />
      </section>

      {/* ── Main Grid ───────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Appointments */}
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

        {/* Right column */}
        <div className="space-y-5">

          {/* Notifications */}
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-bold text-slate-800">Notifications</h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700">
                  {unreadCount} new
                </span>
              )}
            </div>
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
          </div>

          {/* Health Tip Card */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 text-white shadow-md"
            style={{ background: 'linear-gradient(145deg, #0b74ff 0%, #0546d0 60%, #14b8a6 100%)' }}
          >
            <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-white/20 p-2">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-heading text-sm font-bold">Health Tip</h3>
              </div>
              <p className="text-sm leading-relaxed text-white/85">
                Regular check-ups detect health issues early, when they're most treatable. Don't wait — schedule your annual physical today.
              </p>
              <button
                type="button"
                onClick={() => navigate('/book')}
                className="mt-4 flex items-center gap-1 text-xs font-semibold text-white/80 transition-colors hover:text-white"
              >
                Book a check-up <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

