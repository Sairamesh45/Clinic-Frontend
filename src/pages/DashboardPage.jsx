import { Calendar, MapPin, Stethoscope, Activity, TrendingUp, Clock, AlertCircle, Scale } from 'lucide-react'
import Button from '../components/Button'
import StatusBadge from '../components/StatusBadge'
import { useAppContext } from '../hooks/useAppContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function DashboardPage() {
  const { role } = useAuth()
  const navigate = useNavigate()

  // Mock data for Patient Dashboard
  const upcomingAppointments = [
    { id: 1, doctor: 'Dr. Sarah Wilson', speciality: 'Cardiology', date: '2023-10-24', time: '09:30 AM', status: 'BOOKED', location: 'Room 304' },
    { id: 2, doctor: 'Dr. James Chen', speciality: 'General Practice', date: '2023-11-05', time: '02:00 PM', status: 'PENDING', location: 'Room 102' },
  ]

  const healthVitals = [
    { label: 'Heart Rate', value: '72 bpm', status: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Activity },
    { label: 'Blood Pressure', value: '120/80', status: 'Optimal', color: 'text-blue-600', bg: 'bg-blue-50', icon: TrendingUp },
    { label: 'Weight', value: '70 kg', status: 'Stable', color: 'text-purple-600', bg: 'bg-purple-50', icon: Scale },
  ]

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

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {healthVitals.map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>
                  {stat.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Appointments Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Upcoming Appointments</h2>
            <Button variant="ghost" className="text-primary hover:bg-primary/5">View All</Button>
          </div>

          <div className="space-y-4">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row gap-6 hover:border-primary/20 transition-colors group">
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-4 min-w-[100px] border border-slate-100 group-hover:border-primary/10 group-hover:bg-primary/5 transition-colors">
                  <span className="text-xs font-bold text-slate-400 uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-2xl font-bold text-primary">{new Date(apt.date).getDate()}</span>
                  <span className="text-xs font-semibold text-slate-500">{apt.time}</span>
                </div>
                
                <div className="flex-1 flex flex-col justify-center gap-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{apt.doctor}</h3>
                      <p className="text-sm text-slate-500 font-medium">{apt.speciality}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {apt.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      45 mins
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {upcomingAppointments.length === 0 && (
               <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No upcoming appointments</p>
                  <Button variant="link" onClick={() => navigate('/book')} className="mt-2 text-primary">Schedule one now</Button>
               </div>
            )}
          </div>
        </div>

        {/* Sidebar/Notifications Column */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
           <div className="glass-panel p-0 rounded-2xl overflow-hidden divide-y divide-slate-50">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3">
                   <div className="mt-1 h-2 w-2 rounded-full bg-red-500 shrink-0" />
                   <div>
                      <p className="text-sm font-semibold text-slate-700">Appointment Reminder</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">Your appointment with Dr. Wilson is tomorrow at 9:30 AM. Please arrive 10 mins early.</p>
                      <p className="text-[10px] text-slate-400 mt-2">2 hours ago</p>
                   </div>
                </div>
              ))}
              <div className="p-3 bg-slate-50 text-center">
                 <button className="text-xs font-semibold text-primary hover:underline">Mark all as read</button>
              </div>
           </div>

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

