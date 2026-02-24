import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  Activity, 
  LayoutDashboard, 
  CalendarPlus, 
  ListOrdered, 
  Stethoscope, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  User 
} from 'lucide-react'
import { useAppContext } from '../hooks/useAppContext'
import { useAuth } from '../hooks/useAuth'
import { APP_NAME } from '../config/appConfig'
import { ToastStack } from '../context/ToastContext'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', roles: ['patient'], icon: LayoutDashboard },
  { label: 'Book Appointment', path: '/book', roles: ['patient'], icon: CalendarPlus },
  { label: 'Queue Management', path: '/queue', roles: ['reception'], icon: ListOrdered },
  { label: 'Doctor Panel', path: '/doctor', roles: ['doctor'], icon: Stethoscope },
]

export default function MainLayout({ children }) {
  const { role, logout } = useAuth()
  const { activeSection, setActiveSection } = useAppContext()
  const location = useLocation()
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
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white border-r border-slate-100 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="flex h-20 items-center gap-3 px-6 border-b border-slate-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-glow text-white">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-slate-800 leading-tight">{APP_NAME}</h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Clinic Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="px-4 text-xs font-semibold uppercase text-slate-400 tracking-wider mb-4">Menu</p>
          {visibleItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-slate-100 p-4">
          <button 
            onClick={logout}
            className="flex w-full items-center justify-between rounded-xl p-3 hover:bg-red-50 group transition-colors"
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
        <header className="flex h-20 items-center justify-between bg-white/80 backdrop-blur px-6 lg:px-10 border-b border-slate-100/50 sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
             {/* Title or Breadcrumb (optional) */}
             <h2 className="text-xl font-heading font-bold text-slate-800 hidden md:block">
               {activeSection || 'Dashboard'}
             </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* Search Bar (Visual Only) */}
             <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-full border border-slate-100 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all w-64">
                <Search className="h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-600"
                />
             </div>

             {/* Notifications */}
             <button className="relative rounded-full p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
             </button>
             
             {/* Mobile Profile Trigger (optional if needed) */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10">
           <div className="mx-auto max-w-7xl animate-fade-in">
             {children}
           </div>
        </main>
      </div>
    </div>
  )
}
