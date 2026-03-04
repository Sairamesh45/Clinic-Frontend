import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Brain,
  RefreshCw,
  AlertCircle,
  Clock,
  FileText,
  Cpu,
  Hash,
  Sparkles,
  CheckCircle2,
  Activity,
  Loader2,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useAiSummary } from '../hooks/useAiSummary'
import { useAuth } from '../hooks/useAuth'
import PatientTimeline from '../components/PatientTimeline'
import LabTrendsChart from '../components/LabTrendsChart'
import AddEventForm from '../components/AddEventForm'
import UploadDocumentForm from '../components/UploadDocumentForm'
import Button from '../components/Button'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoString))
}

function formatMs(ms) {
  if (ms == null) return null
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color = 'text-primary', bg = 'bg-primary/10' }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 shadow-card backdrop-blur-sm">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  )
}

function SkeletonBlock({ className = '', style }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} style={style} />
}

function SummarySkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card space-y-3">
        {[100, 95, 88, 100, 92, 75, 85, 60].map((w, i) => (
          <SkeletonBlock key={i} className="h-4" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

function SummaryError({ message, onRetry }) {
  return (
    <div className="flex items-start gap-4 rounded-3xl border border-red-100 bg-red-50 p-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
        <AlertCircle className="h-5 w-5 text-red-500" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-red-700">Summary Unavailable</p>
        <p className="mt-0.5 text-sm text-red-500">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-xs font-semibold text-red-600 hover:underline">
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AiSummaryPage() {
  const { id } = useParams()
  const { role } = useAuth()
  const { data, loading, error, refetch } = useAiSummary(id)
  const [showForm, setShowForm] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [timelineKey, setTimelineKey] = useState(0)
  const isDoctor = role === 'doctor'

  // Called after a new event is saved — refresh timeline + regenerate summary
  const handleEventSaved = () => {
    setShowForm(false)
    setTimelineKey((k) => k + 1)
    refetch(true)
  }

  const handleUploadSuccess = () => {
    setShowUpload(false)
    setTimelineKey((k) => k + 1)
    refetch(true)
  }

  // Bottom grid shows once summary has resolved at least once; stays visible during regeneration
  const summaryResolved = data !== null || (!loading && error !== null)

  return (
    <div className="space-y-6">

      {/* ═══════════════════════════════════════════════════════════════
           TOP SECTION — Dashboard header + AI Summary
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">

        {/* Subtle gradient backdrop */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03]" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative p-6 sm:p-8">

          {/* ── Header row ── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-glow">
                <Brain className="h-7 w-7" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary/50">
                  AI-Powered · Clinical Dashboard
                </p>
                <h1 className="font-heading text-2xl font-bold text-slate-800 leading-tight">
                  Patient Summary
                </h1>
                <p className="mt-0.5 font-mono text-xs text-slate-400">
                  {id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start">
              {data && !loading && (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-600">
                  <Activity className="h-3 w-3" />
                  Live
                </span>
              )}
              {loading && data && (
                <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[11px] font-semibold text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Regenerating…
                </span>
              )}
              {/* Show button whenever we have had data at least once */}
              {(data || (!loading && error)) && (
                <Button variant="secondary" onClick={() => refetch(true)} disabled={loading}>
                  {loading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <RefreshCw className="h-3.5 w-3.5" />}
                  {loading ? 'Regenerating…' : 'Regenerate'}
                </Button>
              )}
              <Button variant="secondary" onClick={() => setShowUpload((v) => !v)} className="ml-2">
                Upload Document
              </Button>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="my-6 border-t border-slate-100" />

          {/* ── Summary body ── */}
          {loading && !data && <SummarySkeleton />}

          {!loading && error && !data && (
            <SummaryError message={error} onRetry={() => refetch(false)} />
          )}

          {data && (
            <div className="space-y-5">

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  icon={Hash}
                  label="Word Count"
                  value={data.word_count?.toLocaleString() ?? '—'}
                />
                <StatCard
                  icon={FileText}
                  label="Events Analysed"
                  value={data.event_count?.toLocaleString() ?? '—'}
                  color="text-accent"
                  bg="bg-accent/10"
                />
                <StatCard
                  icon={Cpu}
                  label="Model"
                  value={data.model ?? '—'}
                  color="text-violet-600"
                  bg="bg-violet-50"
                />
                <StatCard
                  icon={Clock}
                  label="Generated In"
                  value={formatMs(data.total_duration_ms) ?? '—'}
                  color="text-amber-600"
                  bg="bg-amber-50"
                />
              </div>

              {/* Cache notice */}
              {data.cached && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />
                  <span>
                    Served from cache&nbsp;·&nbsp;
                    <span className="font-medium">may be up to 24 h old.</span>
                    &nbsp;Click <strong>Regenerate</strong> to force a fresh summary.
                  </span>
                </div>
              )}

              {/* Narrative */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60 p-5">

                {/* Regenerating overlay — shown while a refresh is in flight */}
                {loading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/75 backdrop-blur-[3px]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">Generating new summary…</p>
                  </div>
                )}

                {/* Card header */}
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Physician Narrative
                    </p>
                  </div>
                  <button
                    onClick={() => refetch(true)}
                    disabled={loading}
                    title="Regenerate summary"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <RefreshCw className="h-3 w-3" />}
                    Regenerate Summary
                  </button>
                </div>

                {/* Summary text */}
                <p className={`text-[0.95rem] leading-[1.9] text-slate-700 transition-opacity duration-300 ${loading ? 'opacity-30 select-none' : 'opacity-100'}`}>
                  {data.summary}
                </p>
              </div>

              {/* Footer meta */}
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                {loading ? 'Regenerating…' : <>Generated&nbsp;<span className="font-medium text-slate-500">{formatDate(data.generated_at)}</span></>}
              </p>

            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
           ADD CLINICAL EVENT — doctors only
      ═══════════════════════════════════════════════════════════════ */}
      {isDoctor && (
        <div className="overflow-hidden rounded-3xl border border-primary/15 bg-white shadow-card">
          {/* Toggle header */}
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex w-full items-center gap-3 px-6 py-4 text-left transition hover:bg-primary/[0.03]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Plus className="h-4 w-4 text-primary" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-dark">Add Clinical Entry</p>
              <p className="text-xs text-neutral-dark/50">Record a prescription, diagnosis, lab result, or other event</p>
            </div>
            {showForm
              ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
              : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
          </button>

          {/* Form */}
          {showForm && (
            <div className="border-t border-slate-100 px-6 pb-6 pt-5">
              <AddEventForm patientId={id} onSuccess={handleEventSaved} />
            </div>
          )}
        </div>
      )}

      {/* Upload document (any authenticated user) */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
        <button
          onClick={() => setShowUpload((v) => !v)}
          className="flex w-full items-center gap-3 px-6 py-4 text-left transition hover:bg-primary/[0.03]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-neutral-dark">Upload Document</p>
            <p className="text-xs text-neutral-dark/50">Upload a PDF medical document for this patient</p>
          </div>
          {showUpload ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
        </button>

        {showUpload && (
          <div className="border-t border-slate-100 px-6 pb-6 pt-5">
            <UploadDocumentForm patientId={id} onSuccess={handleUploadSuccess} />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
           BOTTOM GRID — Timeline (left) | Lab Chart (right)
      ═══════════════════════════════════════════════════════════════ */}
      {summaryResolved && (
        <div className="grid gap-6 lg:grid-cols-5">

          {/* Timeline — wider column */}
          <div className="lg:col-span-3">
            <PatientTimeline patientId={id} refreshKey={timelineKey} />
          </div>

          {/* Lab Chart — narrower column, sticky on large screens */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6">
              <LabTrendsChart patientId={id} />
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
