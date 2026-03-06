import { BellDot } from 'lucide-react'
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
    <div className="divide-y divide-slate-50">
      {notifications.map((n, i) => (
        <div
          key={n.id || i}
          className={`flex flex-col gap-2.5 px-4 py-4 transition-colors ${n.read ? 'bg-white' : 'bg-sky-50/60'}`}
        >
          <div className="flex items-start gap-3">
            {/* Dot indicator */}
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-slate-300' : 'bg-accent'}`}
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${n.read ? 'text-slate-500' : 'text-slate-800'}`}>
                {n.title || 'Notification'}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500 line-clamp-2">
                {n.body || n.message || 'You have a new notification.'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pl-5">
            <span className="text-[10px] text-slate-400">
              {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}
            </span>
            {!n.read && (
              <button
                type="button"
                onClick={() => onMarkRead?.(n.id)}
                disabled={notificationLoadingId === n.id}
                className="text-[11px] font-semibold text-primary transition-colors hover:text-primary-dark disabled:opacity-50"
              >
                {notificationLoadingId === n.id ? 'Marking…' : 'Mark read'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderSkeleton = () => (
    <div className="divide-y divide-slate-50">
      {placeholderSlots.map((_, idx) => (
        <div key={`notification-skeleton-${idx}`} className="flex items-start gap-3 px-4 py-4">
          <div className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/5 animate-pulse rounded-full bg-slate-200" />
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-slate-200" />
            <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )

  const renderEmpty = () => (
    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <BellDot className="h-8 w-8 text-slate-300" />
      <p className="text-sm font-medium text-slate-400">All caught up!</p>
    </div>
  )

  const renderError = () => (
    <div className="space-y-3 px-4 py-6 text-center">
      <p className="text-sm font-semibold text-red-500">{error}</p>
      <Button variant="ghost" onClick={safeOnRetry}>Retry</Button>
    </div>
  )

  return (
    <div className="glass-panel overflow-hidden rounded-2xl">
      {loading ? renderSkeleton() : error ? renderError() : hasNotifications ? renderList() : renderEmpty()}
      <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-center">
        <button
          type="button"
          onClick={onMarkAll}
          disabled={markAllLoading}
          className="text-xs font-semibold text-primary transition-colors hover:text-primary-dark disabled:opacity-50"
        >
          {markAllLoading ? 'Marking…' : 'Mark all as read'}
        </button>
      </div>
    </div>
  )
}
