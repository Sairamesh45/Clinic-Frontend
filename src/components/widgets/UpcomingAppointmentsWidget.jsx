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

  const Header = () => (
    <div className="flex items-center justify-between">
      <h2 className="font-heading text-xl font-bold text-slate-800">Upcoming Appointments</h2>
      <button
        type="button"
        onClick={handleViewAll}
        className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
      >
        View All
      </button>
    </div>
  )

  if (error && !loading) {
    return (
      <div className="space-y-4">
        <Header />
        <div className="glass-panel rounded-2xl p-6 text-center">
          <p className="text-sm font-semibold text-red-500">{error}</p>
          <Button variant="ghost" className="mt-3" onClick={onRetry}>Retry</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Header />
        <div className="space-y-4">
          {skeletonCards.map((_, idx) => (
            <div
              key={`apt-skeleton-${idx}`}
              className="glass-panel animate-pulse rounded-2xl p-5"
            >
              <div className="flex gap-5">
                <div className="h-20 w-20 shrink-0 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-4 w-2/5 rounded-full bg-slate-200" />
                  <div className="h-3 w-1/3 rounded-full bg-slate-200" />
                  <div className="h-3 w-1/2 rounded-full bg-slate-200" />
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
      <Header />
      <div className="space-y-4">
        {appointments && appointments.length > 0 ? (
          appointments.map((apt) => (
            <div
              key={apt.id}
              onClick={() => navigate('/queue')}
              className="glass-panel group cursor-pointer rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-card-hover"
            >
              <div className="flex flex-col gap-5 sm:flex-row">
                {/* Date block */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors group-hover:border-primary/15 group-hover:bg-primary/5 sm:min-w-[90px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {new Date(apt.date).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-bold text-primary">{new Date(apt.date).getDate()}</span>
                  <span className="mt-0.5 text-xs font-semibold text-slate-500">{apt.time}</span>
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-center gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800">{apt.doctor}</h3>
                      <p className="text-sm font-medium text-slate-500">{apt.speciality}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>

                  {apt.tokenNumber && (
                    <div className="mt-1 inline-flex items-center gap-1.5 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      <Hash className="h-3.5 w-3.5" />
                      Token: {apt.tokenNumber}
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {apt.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      45 mins
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-500">No upcoming appointments</p>
            <Button variant="link" onClick={handleBookNow} className="mt-2 text-primary">
              Schedule one now
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
