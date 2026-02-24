import { Calendar, MapPin, Clock, Hash } from 'lucide-react'
import Button from '../Button'
import StatusBadge from '../StatusBadge'
import { useNavigate } from 'react-router-dom'

const skeletonCards = Array.from({ length: 2 })

export default function UpcomingAppointmentsWidget({
  appointments = [],
  loading,
  error,
  onRetry,
  onViewAll,
  onBookNow,
}) {
  const navigate = useNavigate()
  const handleViewAll = onViewAll || (() => {})
  const handleBookNow = onBookNow || handleViewAll

  if (error && !loading) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-center text-slate-500">
        <p className="text-sm font-semibold text-red-500">{error}</p>
        <Button variant="ghost" className="mt-3" onClick={onRetry}>
          Retry
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Upcoming Appointments</h2>
          <Button variant="ghost" className="text-primary hover:bg-primary/5" onClick={handleViewAll}>
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {skeletonCards.map((_, idx) => (
            <div
              key={`apt-skeleton-${idx}`}
              className="glass-panel p-5 rounded-2xl flex flex-col gap-6 animate-pulse"
            >
              <div className="h-24 w-full rounded-2xl bg-slate-200" />
              <div className="space-y-3">
                <div className="h-4 w-1/3 rounded-full bg-slate-200" />
                <div className="h-3 w-1/2 rounded-full bg-slate-200" />
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="h-3 w-10 rounded-full bg-slate-200" />
                  <div className="h-3 w-16 rounded-full bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Upcoming Appointments</h2>
        <Button variant="ghost" className="text-primary hover:bg-primary/5" onClick={handleViewAll}>
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {appointments && appointments.length > 0 ? (
          appointments.map((apt) => (
            <div
              key={apt.id}
              onClick={() => navigate('/queue')}
              className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row gap-6 hover:border-primary/20 transition-colors group cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-4 min-w-[100px] border border-slate-100 group-hover:border-primary/10 group-hover:bg-primary/5 transition-colors">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {new Date(apt.date).toLocaleString('default', { month: 'short' })}
                </span>
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

                {/* Token Number Display */}
                {apt.tokenNumber && (
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary">
                    <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
                      <Hash className="h-4 w-4" />
                      <span>Token: {apt.tokenNumber}</span>
                    </div>
                  </div>
                )}

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
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No upcoming appointments</p>
            <Button variant="link" onClick={handleBookNow} className="mt-2 text-primary">
              Schedule one now
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
