import { useEffect } from 'react'
import {
  Pill,
  Stethoscope,
  FlaskConical,
  HeartPulse,
  AlertTriangle,
  ShieldCheck,
  Scissors,
  CalendarCheck,
  CircleDot,
  RefreshCw,
  AlertCircle,
  ListOrdered,
  Loader2,
  BadgeCheck,
} from 'lucide-react'
import { usePatientTimeline } from '../hooks/usePatientTimeline'
import Button from './Button'

// ── Event-type config ─────────────────────────────────────────────────────────

const EVENT_CONFIG = {
  medication:    { label: 'Medication',    icon: Pill,          dot: 'bg-primary',       badge: 'bg-primary/10 text-primary',          track: 'bg-primary/20' },
  diagnosis:     { label: 'Diagnosis',     icon: Stethoscope,   dot: 'bg-red-500',        badge: 'bg-red-50 text-red-700',              track: 'bg-red-200' },
  lab_result:    { label: 'Lab Result',    icon: FlaskConical,  dot: 'bg-amber-500',      badge: 'bg-amber-50 text-amber-700',          track: 'bg-amber-200' },
  vital_sign:    { label: 'Vital Sign',    icon: HeartPulse,    dot: 'bg-accent',         badge: 'bg-accent/10 text-accent',            track: 'bg-accent/30' },
  allergy:       { label: 'Allergy',       icon: AlertTriangle, dot: 'bg-rose-500',       badge: 'bg-rose-50 text-rose-700',            track: 'bg-rose-200' },
  immunization:  { label: 'Immunization',  icon: ShieldCheck,   dot: 'bg-emerald-500',    badge: 'bg-emerald-50 text-emerald-700',      track: 'bg-emerald-200' },
  procedure:     { label: 'Procedure',     icon: Scissors,      dot: 'bg-violet-500',     badge: 'bg-violet-50 text-violet-700',        track: 'bg-violet-200' },
  follow_up:     { label: 'Follow-up',     icon: CalendarCheck, dot: 'bg-sky-500',        badge: 'bg-sky-50 text-sky-700',              track: 'bg-sky-200' },
  other:         { label: 'Other',         icon: CircleDot,     dot: 'bg-slate-400',      badge: 'bg-slate-100 text-slate-600',         track: 'bg-slate-200' },
}

const FALLBACK = EVENT_CONFIG.other

function getConfig(eventType) {
  return EVENT_CONFIG[eventType] ?? FALLBACK
}

// ── Highlight extractor ───────────────────────────────────────────────────────

/**
 * Converts event_data dict into human-readable { label, value } pairs.
 * Unknown types fall back to the first 4 key-value pairs.
 */
function extractHighlights(eventType, eventData) {
  if (!eventData || typeof eventData !== 'object') return []

  const d = eventData
  const row = (label, value) => (value != null && value !== '' ? { label, value: String(value) } : null)
  const compact = (...rows) => rows.filter(Boolean)

  switch (eventType) {
    case 'medication':
      return compact(
        row('Drug', d.name ?? d.drug ?? d.medication),
        row('Dosage', d.dosage ?? d.dose),
        row('Frequency', d.frequency),
        row('Route', d.route),
        row('Duration', d.duration),
      )

    case 'diagnosis':
      return compact(
        row('Condition', d.name ?? d.diagnosis ?? d.condition ?? d.description),
        row('ICD Code', d.icd_code ?? d.icd),
        row('Severity', d.severity),
        row('Status', d.status),
      )

    case 'lab_result':
      return compact(
        row('Test', d.test_name ?? d.test ?? d.name),
        row('Result', d.value != null ? `${d.value}${d.unit ? ` ${d.unit}` : ''}` : null),
        row('Flag', d.flag),
        row('Reference', d.reference_range ?? d.normal_range),
      )

    case 'vital_sign':
      return compact(
        row('Type', d.type ?? d.name ?? d.vital),
        row('Value', d.value != null ? `${d.value}${d.unit ? ` ${d.unit}` : ''}` : null),
        row('Systolic / Diastolic', d.systolic != null ? `${d.systolic} / ${d.diastolic} mmHg` : null),
        row('Heart Rate', d.heart_rate != null ? `${d.heart_rate} bpm` : null),
      )

    case 'allergy':
      return compact(
        row('Allergen', d.allergen ?? d.substance ?? d.name),
        row('Reaction', d.reaction ?? d.symptom),
        row('Severity', d.severity),
      )

    case 'immunization':
      return compact(
        row('Vaccine', d.vaccine ?? d.name),
        row('Lot', d.lot_number ?? d.lot),
        row('Site', d.site),
        row('Dose', d.dose_number != null ? `#${d.dose_number}` : null),
      )

    case 'procedure':
      return compact(
        row('Procedure', d.name ?? d.procedure ?? d.description),
        row('Performed By', d.performed_by ?? d.provider),
        row('Site', d.site ?? d.location),
        row('Outcome', d.outcome ?? d.result),
      )

    case 'follow_up':
      return compact(
        row('Reason', d.reason ?? d.description),
        row('Specialty', d.specialty ?? d.department),
        row('With', d.provider ?? d.doctor),
        row('Due Date', d.due_date ?? d.scheduled_date),
      )

    default: {
      // Generic fallback — first 4 key-value pairs, prettified keys
      return Object.entries(d)
        .slice(0, 4)
        .map(([k, v]) => row(k.replace(/_/g, ' '), v))
        .filter(Boolean)
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatEventDate(dateStr) {
  if (!dateStr) return 'Date unknown'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(`${dateStr}T00:00:00`))
}

function confidenceColor(score) {
  if (score == null) return null
  if (score >= 0.85) return 'text-emerald-600'
  if (score >= 0.6) return 'text-amber-600'
  return 'text-red-500'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-2 w-0.5 flex-1 bg-slate-100" />
      </div>
      <div className="flex-1 space-y-2 pb-8 pt-1">
        <div className="h-4 w-32 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-3 w-20 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-16 animate-pulse rounded-xl bg-slate-50" />
      </div>
    </div>
  )
}

function FlagPill({ flag }) {
  if (!flag) return null
  const map = {
    HIGH:     'bg-red-50 text-red-600 border-red-100',
    LOW:      'bg-sky-50 text-sky-600 border-sky-100',
    CRITICAL: 'bg-red-100 text-red-700 border-red-200 font-bold',
    NORMAL:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  }
  const cls = map[flag?.toUpperCase()] ?? 'bg-slate-50 text-slate-500 border-slate-100'
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {flag}
    </span>
  )
}

function TimelineEvent({ event, isLast }) {
  const cfg = getConfig(event.event_type)
  const Icon = cfg.icon
  const highlights = extractHighlights(event.event_type, event.event_data)
  const labFlag = event.event_type === 'lab_result' ? event.event_data?.flag : null

  return (
    <div className="flex gap-4">
      {/* Track + Dot */}
      <div className="flex flex-col items-center">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.dot} shadow-sm`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        {!isLast && (
          <div className="mt-2 w-0.5 flex-1 rounded-full bg-slate-100 min-h-[1.5rem]" />
        )}
      </div>

      {/* Card */}
      <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover">
          {/* Card header */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${cfg.badge}`}>
              {cfg.label}
            </span>
            {event.is_verified && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </span>
            )}
            {labFlag && <FlagPill flag={labFlag} />}
            <span className="ml-auto text-xs font-medium text-slate-400">
              {formatEventDate(event.event_date)}
            </span>
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {highlights.map(({ label, value }) => (
                <div key={label} className="flex flex-col">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                  </dt>
                  <dd className="text-sm font-medium text-slate-700 leading-snug">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Notes */}
          {event.notes && (
            <p className="mt-3 rounded-xl border border-slate-50 bg-slate-50 px-3 py-2 text-xs text-slate-500 leading-relaxed">
              {event.notes}
            </p>
          )}

          {/* Confidence */}
          {event.confidence_score != null && (
            <p className={`mt-2 text-[10px] font-medium ${confidenceColor(event.confidence_score)}`}>
              Confidence&nbsp;{Math.round(event.confidence_score * 100)}%
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PatientTimeline({ patientId, refreshKey }) {
  const { events, meta, loading, loadingMore, error, fetched, fetch, loadMore } =
    usePatientTimeline(patientId)

  // Fetch on mount, and whenever patientId or refreshKey changes.
  // refreshKey increment from parent triggers a full reset of the timeline
  // (e.g. after a new event is saved via AddEventForm).
  useEffect(() => {
    fetch(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, refreshKey])

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
            <ListOrdered className="h-4 w-4 text-slate-500" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-800">Patient Timeline</h2>
            {meta?.total != null && (
              <p className="text-xs text-slate-400">
                {meta.total.toLocaleString()} event{meta.total !== 1 ? 's' : ''} total
              </p>
            )}
          </div>
        </div>

        {/* Event-type count chips */}
        {meta?.event_type_counts?.length > 0 && (
          <div className="hidden flex-wrap justify-end gap-1.5 sm:flex">
            {meta.event_type_counts.map(({ event_type, count }) => {
              const cfg = getConfig(event_type)
              return (
                <span
                  key={event_type}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${cfg.badge}`}
                >
                  {cfg.label}&nbsp;·&nbsp;{count}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-0">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div className="flex-1">
            <p>{error}</p>
            <button
              onClick={() => fetch()}
              className="mt-1.5 text-xs font-semibold text-red-600 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && fetched && !error && events.length === 0 && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-10 text-center">
          <ListOrdered className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm text-slate-400">No clinical events recorded for this patient yet.</p>
        </div>
      )}

      {/* Timeline */}
      {!loading && events.length > 0 && (
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card sm:p-6">
          <div>
            {events.map((event, i) => (
              <TimelineEvent
                key={event.id}
                event={event}
                isLast={i === events.length - 1 && !meta?.has_more}
              />
            ))}
          </div>

          {/* Load More */}
          {meta?.has_more && (
            <div className="mt-2 flex justify-center border-t border-slate-50 pt-4">
              <Button
                variant="secondary"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading…
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Load More Events
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
