import Button from '../Button'

const skeletonSlots = Array.from({ length: 3 })

export default function HealthVitalsWidget({ vitals = [], loading, error, onRetry }) {
  const renderCard = (stat, idx) => (
    <div
      key={stat?.id || `${stat?.label}-${idx}`}
      className="bg-white rounded-lg border border-secondary-200 shadow-card p-6 flex items-center gap-4 transition-shadow duration-300 hover:shadow-lg"
    >
      <div className={`h-14 w-14 rounded-lg flex items-center justify-center flex-shrink-0 ${stat?.bg || 'bg-secondary-100'}`}>
        {stat?.icon ? <stat.icon className={`h-6 w-6 ${stat?.color || 'text-secondary-600'}`} /> : null}
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">{stat?.label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-bold text-secondary-900">{stat?.value}</span>
          {stat?.status && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${stat?.bg || 'bg-secondary-100'} ${stat?.color || 'text-secondary-700'}`}>
              {stat.status}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skeletonSlots.map((_, idx) => (
          <div key={`vital-skel-${idx}`} className="bg-white rounded-lg border border-secondary-200 shadow-card p-6 flex items-center gap-4 animate-pulse">
            <div className="h-14 w-14 rounded-lg bg-secondary-200 flex-shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3 w-24 rounded-md bg-secondary-200" />
              <div className="h-5 w-16 rounded-md bg-secondary-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg border border-secondary-200 shadow-card p-6 col-span-full text-center">
          <p className="text-sm font-semibold text-red-600 mb-3">{error}</p>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!vitals || vitals.length === 0) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg border border-secondary-200 shadow-card p-6 col-span-full text-center text-secondary-600">
          No health data available.
        </div>
      </div>
    )
  }

  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{vitals.map(renderCard)}</div>
}
