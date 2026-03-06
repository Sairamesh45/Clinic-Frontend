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
          className={`p-4 border-b transition-colors flex flex-col gap-3 ${n.read ? 'bg-surface border-secondary-100' : 'bg-primary-50 border-primary-100'}`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${n.read ? 'bg-secondary-300' : 'bg-accent-500'}`} />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-secondary-900">{n.title || 'Notification'}</p>
              <p className="text-xs text-secondary-600 mt-1 line-clamp-2">{n.body || n.message || 'You have a new notification.'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-secondary-500">
            <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}</span>
            {!n.read && (
              <button
                type="button"
                onClick={() => onMarkRead?.(n.id)}
                disabled={notificationLoadingId === n.id}
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
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
        <div key={`notification-skeleton-${idx}`} className="p-4 flex flex-col gap-3 border-b border-secondary-100">
          <div className="flex items-start gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-secondary-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded-md bg-secondary-200 animate-pulse" />
              <div className="h-3 w-32 rounded-md bg-secondary-200 animate-pulse" />
            </div>
          </div>
          <div className="h-3 w-20 rounded-md bg-secondary-200 animate-pulse" />
        </div>
      ))}
    </>
  )

  const renderEmpty = () => (
    <div className="p-6 text-center text-secondary-600 font-medium">No notifications</div>
  )

  const renderError = () => (
    <div className="p-6 text-center space-y-3">
      <p className="text-sm font-semibold text-red-600">{error}</p>
      <Button variant="secondary" size="sm" onClick={safeOnRetry}>
        Retry
      </Button>
    </div>
  )

  return (
    <div className="card p-0 overflow-hidden divide-y divide-secondary-100">
      {loading ? renderSkeleton() : error ? renderError() : hasNotifications ? renderList() : renderEmpty()}
      <div className="p-3 bg-secondary-50 text-center border-t border-secondary-100">
        <button
          type="button"
          onClick={onMarkAll}
          disabled={markAllLoading}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          {markAllLoading ? 'Marking...' : 'Mark all as read'}
        </button>
      </div>
    </div>
  )
}
