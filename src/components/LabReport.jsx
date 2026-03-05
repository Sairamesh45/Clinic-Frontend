import {
  FlaskConical,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText,
  RefreshCw,
} from 'lucide-react'
import { useLabReport } from '../hooks/useLabReport'

// ── Flag config ───────────────────────────────────────────────────────────────

const FLAG_CONFIG = {
  HIGH: {
    label: 'HIGH',
    icon: ArrowUpRight,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
    barColor: 'bg-red-400',
  },
  LOW: {
    label: 'LOW',
    icon: ArrowDownRight,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    barColor: 'bg-blue-400',
  },
  CRITICAL: {
    label: 'CRITICAL',
    icon: AlertTriangle,
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-800',
    badge: 'bg-red-200 text-red-800 border-red-300',
    dot: 'bg-red-700',
    barColor: 'bg-red-600',
  },
  NORMAL: {
    label: 'NORMAL',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    barColor: 'bg-emerald-400',
  },
}

const UNKNOWN_FLAG = {
  label: '—',
  icon: Minus,
  bg: 'bg-slate-50',
  border: 'border-slate-200',
  text: 'text-slate-500',
  badge: 'bg-slate-100 text-slate-500 border-slate-200',
  dot: 'bg-slate-400',
  barColor: 'bg-slate-300',
}

function getFlag(flag) {
  if (!flag) return UNKNOWN_FLAG
  return FLAG_CONFIG[flag.toUpperCase()] ?? UNKNOWN_FLAG
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function shortDate(isoStr) {
  if (!isoStr) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(`${isoStr}T00:00:00`)
  )
}

/**
 * Render a mini bar showing where the value sits relative to the reference range.
 */
function RangeBar({ value, refRange, flag }) {
  if (value == null || !refRange) return null

  // Parse "70–100 mg/dL" or "0.7–1.3 mg/dL" or "<200 mg/dL" etc.
  const m = refRange.match(/([\d.]+)\s*[–\-]\s*([\d.]+)/)
  if (!m) return null

  const lo = parseFloat(m[1])
  const hi = parseFloat(m[2])
  if (isNaN(lo) || isNaN(hi) || lo >= hi) return null

  // Expand range to show out-of-range values
  const padding = (hi - lo) * 0.35
  const viewLo = lo - padding
  const viewHi = hi + padding
  const range = viewHi - viewLo

  // Position of value on the bar (0–100%)
  const pos = Math.max(0, Math.min(100, ((value - viewLo) / range) * 100))

  // Normal zone start and end
  const normalStart = ((lo - viewLo) / range) * 100
  const normalEnd = ((hi - viewLo) / range) * 100

  const f = getFlag(flag)

  return (
    <div className="mt-1.5">
      <div className="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        {/* Normal zone */}
        <div
          className="absolute inset-y-0 bg-emerald-100 rounded-full"
          style={{ left: `${normalStart}%`, width: `${normalEnd - normalStart}%` }}
        />
        {/* Value marker */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-white shadow-sm ${f.dot}`}
          style={{ left: `${pos}%`, transform: `translate(-50%, -50%)` }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[9px] text-slate-400">{lo}</span>
        <span className="text-[9px] text-emerald-500 font-medium">Normal</span>
        <span className="text-[9px] text-slate-400">{hi}</span>
      </div>
    </div>
  )
}

// ── Lab Result Card ───────────────────────────────────────────────────────────

function LabResultCard({ item }) {
  const f = getFlag(item.flag)
  const FlagIcon = f.icon
  const isAbnormal = item.flag && ['HIGH', 'LOW', 'CRITICAL'].includes(item.flag.toUpperCase())

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border p-4 transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5
        ${isAbnormal ? `${f.bg} ${f.border}` : 'bg-white border-slate-150 hover:border-slate-200'}
      `}
    >
      {/* Top row: test name + flag badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-slate-800 truncate">
            {item.test_name}
          </h4>
          {item.event_date && (
            <p className="text-[10px] text-slate-400 mt-0.5">{shortDate(item.event_date)}</p>
          )}
        </div>
        {item.flag && (
          <span
            className={`
              inline-flex items-center gap-1 rounded-full border px-2 py-0.5
              text-[10px] font-bold uppercase tracking-wide whitespace-nowrap
              ${f.badge}
            `}
          >
            <FlagIcon className="h-3 w-3" />
            {f.label}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`text-2xl font-bold tabular-nums ${isAbnormal ? f.text : 'text-slate-800'}`}>
          {item.value_raw || '—'}
        </span>
        {item.unit && (
          <span className="text-xs font-medium text-slate-400">{item.unit}</span>
        )}
      </div>

      {/* Reference range */}
      {item.reference_range && (
        <div className="mt-1">
          <p className="text-[10px] text-slate-400">
            Ref: <span className="font-medium text-slate-500">{item.reference_range}</span>
          </p>
          <RangeBar
            value={item.numeric_value}
            refRange={item.reference_range}
            flag={item.flag}
          />
        </div>
      )}

      {/* Subtle corner accent for abnormal values */}
      {isAbnormal && (
        <div
          className={`absolute -top-4 -right-4 h-12 w-12 rounded-full ${f.barColor} opacity-10`}
        />
      )}
    </div>
  )
}

// ── Summary Stats ─────────────────────────────────────────────────────────────

function SummaryStats({ data }) {
  const highCount = data.items.filter(i => i.flag?.toUpperCase() === 'HIGH').length
  const lowCount = data.items.filter(i => i.flag?.toUpperCase() === 'LOW').length
  const normalCount = data.items.filter(i => i.flag?.toUpperCase() === 'NORMAL').length
  const criticalCount = data.items.filter(i => i.flag?.toUpperCase() === 'CRITICAL').length

  const stats = [
    { label: 'Total Tests', value: data.total, color: 'text-slate-700', bg: 'bg-slate-100', icon: FlaskConical },
    ...(criticalCount > 0 ? [{ label: 'Critical', value: criticalCount, color: 'text-red-800', bg: 'bg-red-100', icon: AlertTriangle }] : []),
    ...(highCount > 0 ? [{ label: 'High', value: highCount, color: 'text-red-600', bg: 'bg-red-50', icon: TrendingUp }] : []),
    ...(lowCount > 0 ? [{ label: 'Low', value: lowCount, color: 'text-blue-600', bg: 'bg-blue-50', icon: TrendingDown }] : []),
    ...(normalCount > 0 ? [{ label: 'Normal', value: normalCount, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 }] : []),
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {stats.map(({ label, value, color, bg, icon: Icon }) => (
        <div
          key={label}
          className={`flex items-center gap-2 rounded-xl ${bg} px-3 py-1.5`}
        >
          <Icon className={`h-3.5 w-3.5 ${color}`} />
          <span className={`text-xs font-semibold ${color}`}>{value}</span>
          <span className="text-[10px] text-slate-500">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LabReport({ patientId, refreshKey }) {
  const { data, loading, error, refetch } = useLabReport(patientId, refreshKey)

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-card sm:p-6">

      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50">
            <FileText className="h-4 w-4 text-violet-600" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-700">Lab Report</p>
            <p className="text-[10px] text-slate-400">
              {data?.total
                ? `${data.total} test${data.total !== 1 ? 's' : ''}${data.abnormal_count > 0 ? ` · ${data.abnormal_count} abnormal` : ''}`
                : 'All lab results at a glance'}
            </p>
          </div>
        </div>
        {data && (
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-500 hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && !data && (
        <div className="flex h-40 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <p className="text-xs text-slate-400">Loading lab results…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div>
            <p>{error}</p>
            <button
              onClick={refetch}
              className="mt-1 text-xs font-semibold text-red-600 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {data?.still_processing && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <Loader2 className="h-4 w-4 shrink-0 text-primary animate-spin" />
          <p className="text-xs text-primary/80">
            Processing uploaded document (OCR + AI extraction)… Results will appear automatically.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && data && data.total === 0 && !data.still_processing && (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50">
            <FlaskConical className="h-6 w-6 text-violet-300" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-slate-500">No lab results yet</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Upload a lab report document to see results here
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && !error && data && data.total > 0 && (
        <div className="space-y-4">

          {/* Abnormal alert banner */}
          {data.abnormal_count > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-800">
                <span className="font-bold">{data.abnormal_count}</span> result{data.abnormal_count !== 1 ? 's' : ''} outside normal range
              </p>
            </div>
          )}

          {/* Stats row */}
          <SummaryStats data={data} />

          {/* Lab result cards grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Show abnormal results first, then normal */}
            {[...data.items]
              .sort((a, b) => {
                const flagOrder = { CRITICAL: 0, HIGH: 1, LOW: 2, NORMAL: 3 }
                const aOrder = flagOrder[a.flag?.toUpperCase()] ?? 3
                const bOrder = flagOrder[b.flag?.toUpperCase()] ?? 3
                return aOrder - bOrder
              })
              .map((item) => (
                <LabResultCard key={item.event_id} item={item} />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
