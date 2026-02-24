import Button from '../Button'

const placeholderSlots = Array.from({ length: 3 })

export default function NotificationsWidget({
  notifications = [],
  loading,
  error,
  onRetry,
  onMarkRead,
  onMarkAll,
  notificationLoadingId,
  markAllLoading,
}) {
  const safeOnRetry = onRetry || (() => {})
  const hasNotifications = notifications && notifications.length > 0

  const renderList = () => (
    <>
      {notifications.map((n, i) => (
        <div
          key={n.id || i}
          className={`p-4 transition-colors flex flex-col gap-3 ${n.read ? 'bg-white' : 'bg-slate-50 border-b border-slate-100'}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-accent shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-slate-700">{n.title || 'Notification'}</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.body || n.message || 'You have a new notification.'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}</span>
            {!n.read && (
              <button
                type="button"
                onClick={() => onMarkRead?.(n.id)}
                disabled={notificationLoadingId === n.id}
                className="text-primary hover:text-primary-dark"
              >
                {notificationLoadingId === n.id ? 'Marking...' : 'Mark as read'}
              </button>
            )}
          </div>
        </div>
      ))}
    </>
  )

  const renderSkeleton = () => (
    <>
      {placeholderSlots.map((_, idx) => (
        <div key={`notification-skeleton-${idx}`} className="p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-slate-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/4 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-3 w-3/4 rounded-full bg-slate-200 animate-pulse" />
            </div>
          </div>
          <div className="h-3 w-1/2 rounded-full bg-slate-200 animate-pulse" />
        </div>
      ))}
    </>
  )

  const renderEmpty = () => (
    <div className="p-6 text-center text-slate-500">No notifications</div>
  )

  const renderError = () => (
    <div className="p-6 text-center text-slate-500 space-y-3">
      <p className="text-sm font-semibold text-red-500">{error}</p>
      <Button variant="ghost" onClick={safeOnRetry}>
        Retry
      </Button>
    </div>
  )

  return (
    <div className="glass-panel p-0 rounded-2xl overflow-hidden divide-y divide-slate-50">
      {loading ? renderSkeleton() : error ? renderError() : hasNotifications ? renderList() : renderEmpty()}
      <div className="p-3 bg-slate-50 text-center">
        <button
          type="button"
          onClick={onMarkAll}
          disabled={markAllLoading}
          className="text-xs font-semibold text-primary hover:underline"
        >
          {markAllLoading ? 'Marking...' : 'Mark all as read'}
        </button>
      </div>
    </div>
  )
}
