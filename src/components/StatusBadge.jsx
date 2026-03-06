import { Clock, MapPin, Stethoscope, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

const STATUS_CONFIG = {
  booked: {
    classes: 'bg-primary-50 text-primary-700 border border-primary-200',
    icon: Clock,
  },
  pending: {
    classes: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    icon: Clock,
  },
  arrived: {
    classes: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: MapPin,
  },
  'in-consultation': {
    classes: 'bg-purple-50 text-purple-700 border border-purple-200',
    icon: Stethoscope,
  },
  completed: {
    classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    icon: CheckCircle2,
  },
  cancelled: {
    classes: 'bg-red-50 text-red-700 border border-red-200',
    icon: AlertCircle,
  },
  default: {
    classes: 'bg-secondary-100 text-secondary-700 border border-secondary-200',
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
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide ${config.classes}`}>
      <Icon className="h-3.5 w-3.5" />
      {normalized.replace(/-/g, ' ')}
    </span>
  )
}
