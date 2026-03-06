import Button from '../Button'

const skeletonSlots = Array.from({ length: 3 })

export default function HealthVitalsWidget({ vitals = [], loading, error, onRetry }) {
  const renderCard = (stat, idx) => (
    <div
      key={stat?.id || `${stat?.label}-${idx}`}
      className="glass-panel group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat?.bg || 'bg-slate-100'}`}>
          {stat?.icon ? <stat.icon className={`h-5 w-5 ${stat?.color || 'text-slate-600'}`} /> : null}
        </div>
        {stat?.status && (
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${stat?.bg || 'bg-slate-100'} ${stat?.color || 'text-slate-600'}`}>
            {stat.status}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{stat?.label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-800">{stat?.value}</p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skeletonSlots.map((_, idx) => (
          <div key={`vital-skel-${idx}`} className="glass-panel animate-pulse rounded-2xl p-5">
            <div className="h-11 w-11 rounded-xl bg-slate-200" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-2/5 rounded-full bg-slate-200" />
              <div className="h-6 w-1/3 rounded-full bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center">
        <p className="text-sm font-semibold text-red-500">{error}</p>
        <Button variant="ghost" className="mt-3" onClick={onRetry}>Retry</Button>
      </div>
    )
  }

  if (!vitals || vitals.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-slate-400">
        <p className="text-sm font-medium">No health vitals on record yet.</p>
      </div>
    )
  }

  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{vitals.map(renderCard)}</div>
}
