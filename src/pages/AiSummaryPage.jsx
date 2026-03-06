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
  Upload,
  FlaskConical,
  ListOrdered,
} from 'lucide-react'
import { useAiSummary } from '../hooks/useAiSummary'
import { useAuth } from '../hooks/useAuth'
import PatientTimeline from '../components/PatientTimeline'
import LabTrendsChart from '../components/LabTrendsChart'
import LabReport from '../components/LabReport'
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
    <div className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-4.5 w-4.5 ${color}`} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  )
}

function SummarySkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[66px] animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
        {[100, 95, 88, 100, 92, 75, 85, 60].map((w, i) => (
          <div
            key={i}
            className="h-4 animate-pulse rounded-full bg-slate-200"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function SummaryError({ message, onRetry }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-red-100 bg-red-50 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
        <AlertCircle className="h-5 w-5 text-red-500" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-red-700">Summary Unavailable</p>
        <p className="mt-0.5 text-sm text-red-500">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-semibold text-red-600 hover:underline"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

function CollapsiblePanel({ icon: Icon, iconBg, iconColor, title, subtitle, borderColor = 'border-slate-100', children, open, onToggle }) {
  return (
    <div className={`glass-panel overflow-hidden rounded-2xl border ${borderColor}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-primary/[0.03]"
      >
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
          : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
      </button>
      {open && (
        <div className="border-t border-slate-100 px-6 pb-6 pt-5">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AiSummaryPage() {
  const { id } = useParams()
  const { role } = useAuth()
  const { data, loading, error, processing, refetch } = useAiSummary(id)
  const [showForm, setShowForm] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [timelineKey, setTimelineKey] = useState(0)
  const isDoctor = role === 'doctor'

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

  const summaryResolved = data !== null || (!loading && error !== null) || processing

  return (
    <div className="space-y-6">

      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl px-8 py-9 md:px-10"
        style={{ background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 45%, #d1fae5 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="absolute top-1/2 -left-12 h-56 w-56 rounded-full bg-teal-200/40 blur-3xl" />
          <div className="absolute -bottom-14 right-1/3 h-48 w-48 rounded-full bg-blue-100/60 blur-2xl" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ai-dots" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#0284c7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ai-dots)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          {/* Title */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-primary/25"
              style={{ background: 'linear-gradient(145deg, #0284c7, #0369a1)' }}>
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary/60">
                AI-Powered · Clinical Dashboard
              </p>
              <h1 className="font-heading text-2xl font-bold leading-tight text-slate-900">
                Patient Summary
              </h1>
              <p className="mt-0.5 font-mono text-xs text-slate-400">{id}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start">
            {data && !loading && (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-emerald-600 backdrop-blur-sm">
                <Activity className="h-3 w-3" />
                Live
              </span>
            )}
            {loading && data && (
              <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-primary backdrop-blur-sm">
                <Loader2 className="h-3 w-3 animate-spin" />
                Regenerating…
              </span>
            )}
            {(data || (!loading && error)) && (
              <Button variant="secondary" onClick={() => refetch(true)} disabled={loading}>
                {loading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <RefreshCw className="h-3.5 w-3.5" />}
                {loading ? 'Regenerating…' : 'Regenerate'}
              </Button>
            )}
            <button
              type="button"
              onClick={() => setShowUpload((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            >
              <Upload className="h-4 w-4 text-slate-500" />
              Upload Document
            </button>
          </div>
        </div>
      </div>

      {/* ── AI Summary Card ───────────────────────────────────────────── */}
      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-heading text-lg font-bold text-slate-800">AI Summary</h2>
          {data && !loading && (
            <span className="ml-auto text-[11px] font-medium text-slate-400">
              {formatDate(data.generated_at)}
            </span>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Loading — no data yet */}
          {loading && !data && !processing && <SummarySkeleton />}

          {/* Processing documents */}
          {processing && (
            <div className="flex items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
              <div>
                <p className="font-semibold text-primary">Processing Documents</p>
                <p className="mt-0.5 text-sm text-primary/70">
                  Your uploaded documents are being analyzed (OCR + AI extraction). This usually takes 30–60 seconds.
                  The summary will appear automatically when ready.
                </p>
              </div>
            </div>
          )}

          {/* Error — no data */}
          {!loading && error && !data && !processing && (
            <SummaryError message={error} onRetry={() => refetch(false)} />
          )}

          {data && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard icon={Hash} label="Words" value={data.word_count?.toLocaleString() ?? '—'} />
                <StatCard icon={FileText} label="Events" value={data.event_count?.toLocaleString() ?? '—'} color="text-accent" bg="bg-accent/10" />
                <StatCard icon={Cpu} label="Model" value={data.model ?? '—'} color="text-violet-600" bg="bg-violet-50" />
                <StatCard icon={Clock} label="Generated In" value={formatMs(data.total_duration_ms) ?? '—'} color="text-amber-600" bg="bg-amber-50" />
              </div>

              {/* Cache notice */}
              {data.cached && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />
                  <span>
                    Served from cache&nbsp;·&nbsp;
                    <span className="font-medium">may be up to 24 h old.</span>
                    &nbsp;Click <strong>Regenerate</strong> for a fresh summary.
                  </span>
                </div>
              )}

              {/* Narrative */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                {loading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/80 backdrop-blur-[3px]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">Generating new summary…</p>
                  </div>
                )}

                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Physician Narrative
                  </p>
                  <button
                    onClick={() => refetch(true)}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    Regenerate
                  </button>
                </div>

                <p className={`text-[0.95rem] leading-[1.9] text-slate-700 transition-opacity duration-300 ${loading ? 'opacity-30 select-none' : 'opacity-100'}`}>
                  {data.summary}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Action Panels ────────────────────────────────────────────── */}
      {isDoctor && (
        <CollapsiblePanel
          icon={Plus}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Add Clinical Entry"
          subtitle="Record a prescription, diagnosis, lab result, or other event"
          borderColor="border-primary/15"
          open={showForm}
          onToggle={() => setShowForm((v) => !v)}
        >
          <AddEventForm patientId={id} onSuccess={handleEventSaved} />
        </CollapsiblePanel>
      )}

      <CollapsiblePanel
        icon={Upload}
        iconBg="bg-sky-50"
        iconColor="text-primary"
        title="Upload Document"
        subtitle="Upload a PDF medical document for this patient"
        open={showUpload}
        onToggle={() => setShowUpload((v) => !v)}
      >
        <UploadDocumentForm patientId={id} onSuccess={handleUploadSuccess} />
      </CollapsiblePanel>

      {/* ── Lab Report ───────────────────────────────────────────────── */}
      {summaryResolved && (
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50">
              <FlaskConical className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="font-heading text-xl font-bold text-slate-800">Lab Report</h2>
          </div>
          <LabReport patientId={id} refreshKey={timelineKey} />
        </section>
      )}

      {/* ── Timeline + Chart Grid ─────────────────────────────────────── */}
      {summaryResolved && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50">
                <ListOrdered className="h-4 w-4 text-violet-600" />
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-800">Clinical Timeline</h2>
            </div>
            <PatientTimeline patientId={id} refreshKey={timelineKey} />
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10">
                <Activity className="h-4 w-4 text-accent" />
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-800">Lab Trends</h2>
            </div>
            <div className="lg:sticky lg:top-6">
              <LabTrendsChart patientId={id} />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
