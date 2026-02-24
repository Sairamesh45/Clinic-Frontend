import Button from '../Button'

const skeletonSlots = Array.from({ length: 3 })

export default function HealthVitalsWidget({ vitals = [], loading, error, onRetry }) {
  const renderCard = (stat, idx) => (
    <div
      key={stat?.id || `${stat?.label}-${idx}`}
      className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-shadow"
    >
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat?.bg || 'bg-slate-100'}`}>
        {stat?.icon ? <stat.icon className={`h-6 w-6 ${stat?.color || 'text-slate-600'}`} /> : null}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat?.label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-800">{stat?.value}</span>
          {stat?.status && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat?.bg || ''} ${stat?.color || ''}`}>
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
          <div key={`vital-skel-${idx}`} className="glass-panel p-6 rounded-2xl flex items-center gap-4 animate-pulse">
            <div className="h-12 w-12 rounded-xl bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-2/5 rounded-full bg-slate-200" />
              <div className="h-5 w-1/3 rounded-full bg-slate-200" />
              <div className="h-3 w-1/4 rounded-full bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-panel p-6 rounded-2xl col-span-full text-center text-slate-500">
          <p className="text-sm font-semibold text-red-500">{error}</p>
          <Button variant="ghost" className="mt-3" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!vitals || vitals.length === 0) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-panel p-6 rounded-2xl col-span-full text-center text-slate-500">
          No health data available.
        </div>
      </div>
    )
  }

  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{vitals.map(renderCard)}</div>
}
