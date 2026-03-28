import { Clock, MapPin, Stethoscope, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

const STATUS_CONFIG = {
  booked: {
    classes: 'bg-status-booked/20 text-status-booked',
    icon: Clock,
  },
  pending: {
    classes: 'bg-status-arrived/20 text-status-arrived',
    icon: Clock,
  },
  arrived: {
    classes: 'bg-status-arrived/20 text-status-arrived',
    icon: MapPin,
  },
  'in-consultation': {
    classes: 'bg-status-in-consultation/20 text-status-in-consultation',
    icon: Stethoscope,
  },
  completed: {
    classes: 'bg-status-completed/20 text-status-completed',
    icon: CheckCircle2,
  },
  cancelled: {
    classes: 'bg-status-cancelled/20 text-status-cancelled',
    icon: AlertCircle,
  },
  default: {
    classes: 'bg-background text-text-secondary',
    icon: Circle,
  },
}

function normalizeStatus(status = '') {
  return status.toString().trim().toLowerCase().replace(/[_\s]+/g, '-')
}

export default function StatusBadge({ status = 'UNKNOWN' }) {
  const normalized = normalizeStatus(status)
  // Handle some common aliases or existing data
  const key = normalized === 'in_consultation' ? 'in-consultation' : normalized
  
  const config = STATUS_CONFIG[key] || STATUS_CONFIG.default
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${config.classes}`}>
      <Icon className="h-3 w-3" />
      {normalized.replace(/-/g, ' ')}
    </span>
  )
}
