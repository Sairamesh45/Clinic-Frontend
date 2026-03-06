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
      <div className="bg-white rounded-lg border border-secondary-200 shadow-card p-6 text-center">
        <p className="text-sm font-semibold text-red-600 mb-3">{error}</p>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-semibold text-secondary-900">Upcoming Appointments</h2>
          <Button variant="link" onClick={handleViewAll}>
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {skeletonCards.map((_, idx) => (
            <div
              key={`apt-skeleton-${idx}`}
              className="bg-white rounded-lg border border-secondary-200 shadow-card p-5 flex flex-col gap-6 animate-pulse"
            >
              <div className="h-20 w-full rounded-lg bg-secondary-200" />
              <div className="space-y-3">
                <div className="h-4 w-32 rounded-md bg-secondary-200" />
                <div className="h-3 w-48 rounded-md bg-secondary-200" />
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
        <h2 className="text-xl font-heading font-semibold text-secondary-900">Upcoming Appointments</h2>
        <Button variant="link" onClick={handleViewAll}>
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {appointments && appointments.length > 0 ? (
          appointments.map((apt) => (
            <div
              key={apt.id}
              onClick={() => navigate('/queue')}
              className="bg-white rounded-lg border border-secondary-200 shadow-card p-5 flex flex-col sm:flex-row gap-6 transition-shadow duration-300 hover:shadow-lg cursor-pointer hover:border-secondary-300"
            >
              <div className="flex flex-col items-center justify-center rounded-lg bg-primary-50 p-4 min-w-[110px] border border-primary-200">
                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                  {new Date(apt.date).toLocaleString('default', { month: 'short' })}
                </span>
                <span className="text-3xl font-bold text-primary-600 leading-none">{new Date(apt.date).getDate()}</span>
                <span className="text-xs font-semibold text-primary-700 mt-1">{apt.time}</span>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-2">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-secondary-900">{apt.doctor}</h3>
                    <p className="text-sm text-secondary-600 font-medium">{apt.speciality}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>

                {/* Token Number Display */}
                {apt.tokenNumber && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200 text-sm font-semibold text-primary-700">
                      <Hash className="h-3.5 w-3.5" />
                      <span>Token: {apt.tokenNumber}</span>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-sm text-secondary-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span>{apt.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span>45 mins</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 rounded-lg border-2 border-dashed border-secondary-200 bg-secondary-50">
            <Calendar className="h-10 w-10 text-secondary-300 mx-auto mb-3" />
            <p className="text-secondary-700 font-medium mb-3">No upcoming appointments</p>
            <Button variant="secondary" size="sm" onClick={handleBookNow}>
              Schedule one now
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
