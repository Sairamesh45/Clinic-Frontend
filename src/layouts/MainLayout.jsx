import { useState, useEffect } from 'react'
import { NavLink, useLocation, useMatch } from 'react-router-dom'
import {
  Activity,
  Brain,
  LayoutDashboard,
  CalendarPlus,
  ListOrdered,
  Stethoscope,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User,
  CalendarClock,
  Clock3,
} from 'lucide-react'
import { useAppContext } from '../hooks/useAppContext'
import { useAuth } from '../hooks/useAuth'
import { useDoctorAppointments } from '../hooks/useDoctorAppointments'
import { APP_NAME } from '../config/appConfig'
import { ToastStack } from '../context/ToastContext'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', roles: ['patient'], icon: LayoutDashboard },
  { label: 'Book Appointment', path: '/book', roles: ['patient'], icon: CalendarPlus },
  { label: 'Queue Management', path: '/queue', roles: ['reception'], icon: ListOrdered },
  { label: 'Clinic Hours', path: '/settings/clinic-hours', roles: ['reception'], icon: CalendarClock },
  { label: 'Doctor Panel', path: '/doctor', roles: ['doctor'], icon: Stethoscope },
  { label: 'Availability', path: '/settings/doctor-availability', roles: ['doctor'], icon: Clock3 },
  { label: 'AI Summary', path: '/patients', roles: ['patient', 'doctor', 'reception'], icon: Brain, dynamicPath: true },
]

export default function MainLayout({ children }) {
  const { role, logout, user } = useAuth()
  const { activeSection, setActiveSection } = useAppContext()
  const location = useLocation()
  const patientMatch = useMatch('/patients/:id/*')
  const currentPatientId = patientMatch?.params?.id
  const { appointments } = useDoctorAppointments()

  // If the user is a doctor and there is no patient in the URL, try to
  // link the AI Summary nav item to the currently in-consultation patient.
  const inConsultationAppt = (appointments || []).find((a) => a.status === 'IN_CONSULTATION')
  // Determine a sensible fallback for the AI Summary link:
  // - Patients should link to their own patient page (their user id)
  // - Doctors should link to the currently in-consultation patient's id (if any)
  // - Otherwise leave as null so the UI shows the disabled state
  let fallbackPatientId = null
  if (role === 'patient') {
    fallbackPatientId = user?.id ?? null
  } else {
    fallbackPatientId = inConsultationAppt?.patientId ?? null
  }
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  // Set active section based on current path
  useEffect(() => {
    const active = navItems.find((item) => item.path === location.pathname)
    if (active) {
      setActiveSection(active.label)
    }
  }, [location.pathname, setActiveSection])

  const visibleItems = navItems.filter((item) => item.roles.includes(role))

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-text-primary">
      <ToastStack />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-surface border-r border-secondary-200 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="flex h-20 items-center gap-3 px-6 border-b border-secondary-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 shadow-glow text-white flex-shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-base font-bold text-secondary-900 leading-tight truncate">{APP_NAME}</h1>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary-400">Clinic Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="px-4 text-xs font-semibold uppercase text-secondary-400 tracking-wider mb-4">Menu</p>
          {visibleItems.map((item) => {
            const Icon = item.icon

            // Dynamic items need a patient in the URL — show disabled when none is active
            if (item.dynamicPath) {
              const resolvedPath = (currentPatientId || fallbackPatientId)
                ? `/patients/${currentPatientId ?? fallbackPatientId}/ai-summary`
                : null

              if (!resolvedPath) {
                return (
                  <div
                    key={item.path}
                    title="Navigate to a patient first"
                    className="group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium cursor-not-allowed opacity-50 select-none text-secondary-400"
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {item.label}
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-secondary-500 bg-secondary-100 px-2 py-1 rounded-full whitespace-nowrap">
                      No patient
                    </span>
                  </div>
                )
              }

              return (
                <NavLink
                  key={item.path}
                  to={resolvedPath}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-600'}`} />
                      <span className="flex-1">{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-600'}`} />
                    <span className="flex-1">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-secondary-100 p-4 space-y-2">
          <button 
            onClick={logout}
            className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-red-50 group transition-colors"
          >
             <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-9 w-9 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 flex-shrink-0">
                  <User size={18} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold text-secondary-900 group-hover:text-red-600 truncate">
                    {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}
                  </p>
                  <p className="text-xs text-secondary-500">Sign out</p>
                </div>
             </div>
             <LogOut className="h-4 w-4 text-secondary-400 group-hover:text-red-500 flex-shrink-0 ml-2" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between bg-surface/95 backdrop-blur-sm px-6 lg:px-10 border-b border-secondary-200 sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md p-2 text-secondary-600 hover:bg-secondary-100 transition-colors lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
             {/* Title or Breadcrumb (optional) */}
             <h2 className="text-xl font-heading font-semibold text-secondary-900 hidden md:block">
               {activeSection || 'Dashboard'}
             </h2>
          </div>

          <div className="flex items-center gap-3">
             {/* Search Bar (Visual Only) */}
             <div className="hidden md:flex items-center gap-2 bg-secondary-50 px-4 py-2.5 rounded-lg border border-secondary-200 hover:border-secondary-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all w-64">
                <Search className="h-4 w-4 text-secondary-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none text-sm w-full placeholder:text-secondary-400 text-secondary-700 font-medium"
                />
             </div>

             {/* Notifications */}
             <button className="relative rounded-lg p-2.5 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
             </button>
             
             {/* Mobile Profile Trigger (optional if needed) */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-secondary-50 px-4 py-6 lg:px-10 lg:py-8">
           <div className="mx-auto max-w-7xl animate-fade-in">
             {children}
           </div>
        </main>
      </div>
    </div>
  )
}
