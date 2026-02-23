import { Clock, MapPin, Stethoscope, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

const STATUS_CONFIG = {
  booked: {
    classes: 'bg-sky-100 text-sky-700',
    icon: Clock,
  },
  pending: {
    classes: 'bg-amber-100 text-amber-700',
    icon: Clock,
  },
  arrived: {
    classes: 'bg-indigo-100 text-indigo-700',
    icon: MapPin,
  },
  'in-consultation': {
    classes: 'bg-violet-100 text-violet-700',
    icon: Stethoscope,
  },
  completed: {
    classes: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle2,
  },
  cancelled: {
    classes: 'bg-red-100 text-red-700',
    icon: AlertCircle,
  },
  default: {
    classes: 'bg-slate-100 text-slate-600',
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
