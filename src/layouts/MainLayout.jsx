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
    <div className="flex h-screen overflow-hidden bg-[#f4f6fa] font-sans text-text-primary">
      <ToastStack />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/40 transition-opacity lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white shadow-[4px_0_24px_rgba(0,0,0,0.06)] transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-md shadow-primary/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-base font-bold text-slate-800 leading-tight">{APP_NAME}</h1>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Clinic Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-0.5">
          <p className="px-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-3">Navigation</p>
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
                    className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium cursor-not-allowed opacity-40 select-none text-slate-400"
                  >
                    <Icon className="h-5 w-5 text-slate-300" />
                    {item.label}
                    <span className="ml-auto text-[9px] font-semibold uppercase tracking-wide text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded-full">
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
                    `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      {item.label}
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
                  `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4">
          <button 
            onClick={logout}
            className="flex w-full items-center justify-between rounded-xl p-3 hover:bg-red-50/10 group transition-colors"
          >
             <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <User size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-red-600">
                    {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}
                  </p>
                  <p className="text-xs text-slate-400">Sign out</p>
                </div>
             </div>
             <LogOut className="h-4 w-4 text-slate-300 group-hover:text-red-400" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
          <header className="flex h-16 items-center justify-between bg-white/90 backdrop-blur-md px-6 lg:px-10 shadow-[0_1px_8px_rgba(0,0,0,0.06)] sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
             {/* Title or Breadcrumb (optional) */}
             <h2 className="text-xl font-heading font-bold text-text-primary hidden md:block">
               {activeSection || 'Dashboard'}
             </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* Search Bar (Visual Only) */}
             <div className="hidden md:flex items-center gap-2 bg-[#f4f6fa] px-4 py-2 rounded-xl border-0 focus-within:ring-2 focus-within:ring-primary/20 transition-all w-60">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-600"
                />
             </div>

             {/* Notifications */}
             <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-[#f4f6fa] transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
             </button>
             
             {/* Mobile Profile Trigger (optional if needed) */}
          </div>
        </header>

        {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            <div className="mx-auto max-w-7xl animate-fade-in">
             {children}
           </div>
        </main>
      </div>
    </div>
  )
}
