import { useState } from 'react'
import {
  Heart,
  Thermometer,
  Wind,
  Activity,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
} from 'lucide-react'
import Button from '../Button'

// ── Vital metric definitions ──────────────────────────────────────────────────

const METRICS = [
  {
    key: 'bp',
    label: 'Blood Pressure',
    unit: 'mmHg',
    icon: Heart,
    bg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    getValue: (v) =>
      v.systolic != null && v.diastolic != null ? `${v.systolic}/${v.diastolic}` : null,
    getStatus: (v) => {
      if (v.systolic == null) return null
      if (v.systolic >= 140 || v.diastolic >= 90) return { label: 'HIGH', cls: 'bg-red-100 text-red-700' }
      if (v.systolic >= 130) return { label: 'ELEVATED', cls: 'bg-amber-100 text-amber-700' }
      if (v.systolic < 90 || v.diastolic < 60) return { label: 'LOW', cls: 'bg-sky-100 text-sky-700' }
      return { label: 'NORMAL', cls: 'bg-emerald-100 text-emerald-700' }
    },
  },
  {
    key: 'hr',
    label: 'Heart Rate',
    unit: 'bpm',
    icon: Activity,
    bg: 'bg-pink-50',
    iconColor: 'text-pink-500',
    getValue: (v) => (v.heartRate != null ? String(v.heartRate) : null),
    getStatus: (v) => {
      if (v.heartRate == null) return null
      if (v.heartRate > 100) return { label: 'HIGH', cls: 'bg-red-100 text-red-700' }
      if (v.heartRate < 60) return { label: 'LOW', cls: 'bg-sky-100 text-sky-700' }
      return { label: 'NORMAL', cls: 'bg-emerald-100 text-emerald-700' }
    },
  },
  {
    key: 'temp',
    label: 'Temperature',
    unit: '°C',
    icon: Thermometer,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    getValue: (v) => (v.temperature != null ? Number(v.temperature).toFixed(1) : null),
    getStatus: (v) => {
      if (v.temperature == null) return null
      if (v.temperature >= 38.0) return { label: 'FEVER', cls: 'bg-red-100 text-red-700' }
      if (v.temperature < 36.0) return { label: 'LOW', cls: 'bg-sky-100 text-sky-700' }
      return { label: 'NORMAL', cls: 'bg-emerald-100 text-emerald-700' }
    },
  },
  {
    key: 'rr',
    label: 'Respiration',
    unit: '/min',
    icon: Wind,
    bg: 'bg-teal-50',
    iconColor: 'text-teal-500',
    getValue: (v) => (v.respiration != null ? String(v.respiration) : null),
    getStatus: (v) => {
      if (v.respiration == null) return null
      if (v.respiration > 20) return { label: 'HIGH', cls: 'bg-red-100 text-red-700' }
      if (v.respiration < 12) return { label: 'LOW', cls: 'bg-sky-100 text-sky-700' }
      return { label: 'NORMAL', cls: 'bg-emerald-100 text-emerald-700' }
    },
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(dateStr))
}

// ── Mini trend sparkline ──────────────────────────────────────────────────────

function Sparkline({ values, color = '#0284c7' }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 60, H = 20
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W
    const y = H - ((v - min) / range) * H
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-14 h-4" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// ── Vital card ────────────────────────────────────────────────────────────────

function VitalCard({ metric, vitals }) {
  // Find the most recent record that has a value for this metric
  const latest = vitals.find((v) => metric.getValue(v) != null)
  const value = latest ? metric.getValue(latest) : null
  const status = latest ? metric.getStatus(latest) : null
  const Icon = metric.icon

  // History values for sparkline (numeric, oldest→newest)
  const historyValues = vitals
    .slice()
    .reverse()
    .map((v) => {
      if (metric.key === 'bp') return v.systolic
      if (metric.key === 'hr') return v.heartRate
      if (metric.key === 'temp') return v.temperature != null ? parseFloat(v.temperature) : null
      if (metric.key === 'rr') return v.respiration
      return null
    })
    .filter((n) => n != null)

  const sparkColor =
    status?.label === 'NORMAL' ? '#10b981' :
    status?.label === 'HIGH' || status?.label === 'FEVER' ? '#ef4444' :
    status?.label === 'LOW' ? '#3b82f6' : '#f59e0b'

  return (
    <div className="glass-panel group rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${metric.bg}`}>
          <Icon className={`h-5 w-5 ${metric.iconColor}`} />
        </div>
        {status && (
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${status.cls}`}>
            {status.label}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{metric.label}</p>
        {value != null ? (
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-800 tabular-nums">{value}</span>
            <span className="text-xs font-medium text-slate-400">{metric.unit}</span>
          </div>
        ) : (
          <p className="mt-1 text-sm text-slate-300 italic">No data</p>
        )}
      </div>

      {/* Footer: sparkline + timestamp */}
      <div className="mt-3 flex items-end justify-between gap-2">
        {historyValues.length >= 2 && <Sparkline values={historyValues} color={sparkColor} />}
        {latest?.recordedAt && (
          <span className="flex items-center gap-1 text-[9px] text-slate-400 ml-auto">
            <Clock className="h-2.5 w-2.5" />
            {timeAgo(latest.recordedAt)}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Record Vitals Form ────────────────────────────────────────────────────────

const FORM_FIELDS = [
  { name: 'systolic',    label: 'Systolic BP',    unit: 'mmHg', type: 'number', placeholder: 'e.g. 120', min: 60,  max: 250 },
  { name: 'diastolic',   label: 'Diastolic BP',   unit: 'mmHg', type: 'number', placeholder: 'e.g. 80',  min: 40,  max: 150 },
  { name: 'heartRate',   label: 'Heart Rate',     unit: 'bpm',  type: 'number', placeholder: 'e.g. 72',  min: 30,  max: 250 },
  { name: 'temperature', label: 'Temperature',    unit: '°C',   type: 'number', placeholder: 'e.g. 36.6',min: 30,  max: 45,  step: '0.1' },
  { name: 'respiration', label: 'Respiration',    unit: '/min', type: 'number', placeholder: 'e.g. 16',  min: 4,   max: 60 },
  { name: 'notes',       label: 'Notes (optional)',unit: '',     type: 'text',   placeholder: 'Any additional notes…' },
]

function RecordVitalsForm({ onSubmit, onClose }) {
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)

    // At least one numeric field must be filled
    const hasValue = FORM_FIELDS.slice(0, 5).some((f) => form[f.name]?.trim?.() !== '' && form[f.name] != null && form[f.name] !== '')
    if (!hasValue) {
      setFormError('Please fill in at least one measurement.')
      return
    }

    setSaving(true)
    try {
      await onSubmit(form)
      onClose()
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to save vitals.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
      {/* Form header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent" />
          <span className="text-sm font-bold text-slate-700">Record Vitals</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FORM_FIELDS.map((f) => (
            <div key={f.name} className={f.name === 'notes' ? 'col-span-2 sm:col-span-3' : ''}>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {f.label} {f.unit && <span className="normal-case font-normal">({f.unit})</span>}
              </label>
              <input
                type={f.type}
                name={f.name}
                value={form[f.name] ?? ''}
                onChange={handleChange}
                placeholder={f.placeholder}
                min={f.min}
                max={f.max}
                step={f.step ?? (f.type === 'number' ? '1' : undefined)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-300 focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          ))}
        </div>

        {formError && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {formError}
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Main Widget ───────────────────────────────────────────────────────────────

export default function HealthVitalsWidget({ vitals = [], loading, error, onRetry, onAdd }) {
  const [showForm, setShowForm] = useState(false)

  if (loading && vitals.length === 0) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.key} className="glass-panel animate-pulse rounded-2xl p-4">
              <div className="h-10 w-10 rounded-xl bg-slate-200" />
              <div className="mt-3 space-y-2">
                <div className="h-2.5 w-2/5 rounded-full bg-slate-200" />
                <div className="h-7 w-1/3 rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center">
        <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-red-400" />
        <p className="text-sm font-semibold text-red-500">{error}</p>
        <Button variant="ghost" className="mt-3" onClick={onRetry}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Vitals grid */}
      {vitals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric) => (
            <VitalCard key={metric.key} metric={metric} vitals={vitals} />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl px-6 py-8 text-center">
          <Activity className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-400">No health vitals recorded yet.</p>
          <p className="mt-0.5 text-xs text-slate-400">Tap "Record Vitals" below to add your first reading.</p>
        </div>
      )}

      {/* Record vitals — button or inline form */}
      {!showForm && onAdd && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-3 text-sm font-semibold text-slate-500 transition-colors hover:border-accent/50 hover:bg-teal-50/40 hover:text-accent"
        >
          <Plus className="h-4 w-4" />
          Record Vitals
        </button>
      )}

      {showForm && (
        <RecordVitalsForm
          onSubmit={onAdd}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
