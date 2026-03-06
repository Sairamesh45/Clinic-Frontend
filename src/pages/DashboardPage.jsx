import { Activity, Bell, Calendar, ChevronRight, Clock, Sparkles, TrendingUp } from 'lucide-react'
import Button from '../components/Button'
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
      <div
        className="relative rounded-3xl overflow-hidden px-8 py-9 md:px-10 md:py-11"
        style={{ background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 45%, #d1fae5 100%)' }}
      >
        {/* Decorative blobs — same palette as login page */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="absolute top-1/2 -left-12 h-56 w-56 rounded-full bg-teal-200/40 blur-3xl" />
          <div className="absolute -bottom-14 right-1/3 h-48 w-48 rounded-full bg-blue-100/60 blur-2xl" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dash-dots" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#0284c7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dash-dots)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary/70">{dateStr}</p>
            <h1 className="font-heading text-3xl font-bold text-slate-900 md:text-4xl">
              {getGreeting(now.getHours())},{' '}
              <span className="text-primary">{displayName}</span> 👋
            </h1>
            <p className="text-sm text-slate-500">Here's your health overview for today.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/book')}
              className="flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Calendar className="h-4 w-4" />
              Book Appointment
            </Button>
            <button
              type="button"
              onClick={() => navigate('/queue')}
              className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            >
              <Clock className="h-4 w-4 text-slate-500" />
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
            className={`glass-panel flex items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200 ${stat.onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover' : 'cursor-default'}`}
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              <p className="truncate text-xs font-medium text-slate-500">{stat.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Health Vitals ────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-heading text-xl font-bold text-slate-800">Health Vitals</h2>
        </div>
        <HealthVitalsWidget
          vitals={healthVitals}
          loading={loadingStates.vitals}
          error={errorStates.vitals}
          onRetry={fetchVitals}
        />
      </section>

      {/* ── Main Grid ───────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-3">

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

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Notifications */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50">
                <Bell className="h-4 w-4 text-violet-600" />
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-800">Notifications</h2>
              {unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700">
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

          {/* Health Tip Card — gradient matching login left panel */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg"
            style={{ background: 'linear-gradient(145deg, #0284c7 0%, #0369a1 55%, #14b8a6 100%)' }}
          >
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-heading text-base font-bold">Health Tip</h3>
              </div>
              <p className="text-sm leading-relaxed text-white/90">
                Regular check-ups detect health issues early, when they're most treatable. Don't wait — schedule your annual physical today.
              </p>
              <button
                type="button"
                onClick={() => navigate('/book')}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-white/80 transition-colors hover:text-white"
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

