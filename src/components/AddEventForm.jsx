/**
 * AddEventForm
 * ─────────────────────────────────────────────────────────────────────────────
 * Doctor-facing form to create a manual clinical event for a patient.
 * Calls POST /api/v1/patients/{patientId}/events and invokes onSuccess()
 * so the parent can trigger summary regeneration.
 */

import { useState } from 'react'
import {
  Pill,
  Stethoscope,
  FlaskConical,
  Activity,
  ShieldAlert,
  Syringe,
  Scissors,
  CalendarClock,
  FileText,
  Loader2,
  Plus,
  CheckCircle2,
} from 'lucide-react'
import axiosClient from '../api/axiosClient'

/* ── Event type catalogue ────────────────────────────────────────────────── */
const EVENT_TYPES = [
  { value: 'medication',    label: 'Prescription',  icon: Pill,          color: 'text-violet-600',  bg: 'bg-violet-50  border-violet-200' },
  { value: 'diagnosis',     label: 'Diagnosis',     icon: Stethoscope,   color: 'text-red-600',     bg: 'bg-red-50     border-red-200' },
  { value: 'lab_result',    label: 'Lab Result',    icon: FlaskConical,  color: 'text-amber-600',   bg: 'bg-amber-50   border-amber-200' },
  { value: 'vital_sign',    label: 'Vital Sign',    icon: Activity,      color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { value: 'allergy',       label: 'Allergy',       icon: ShieldAlert,   color: 'text-orange-600',  bg: 'bg-orange-50  border-orange-200' },
  { value: 'immunization',  label: 'Immunization',  icon: Syringe,       color: 'text-teal-600',    bg: 'bg-teal-50    border-teal-200' },
  { value: 'procedure',     label: 'Procedure',     icon: Scissors,      color: 'text-pink-600',    bg: 'bg-pink-50    border-pink-200' },
  { value: 'follow_up',     label: 'Follow-up',     icon: CalendarClock, color: 'text-sky-600',     bg: 'bg-sky-50     border-sky-200' },
  { value: 'other',         label: 'Other',         icon: FileText,      color: 'text-slate-600',   bg: 'bg-slate-50   border-slate-200' },
]

/* ── Structured fields per event type ────────────────────────────────────── */
const FIELD_CONFIGS = {
  medication: [
    { key: 'name',       label: 'Drug name',      placeholder: 'e.g. Metformin 500 mg',    required: true },
    { key: 'dose',       label: 'Dose',           placeholder: 'e.g. 500 mg',              required: false },
    { key: 'frequency',  label: 'Frequency',      placeholder: 'e.g. Twice daily (BD)',    required: false },
    { key: 'route',      label: 'Route',          placeholder: 'e.g. Oral',                required: false },
    { key: 'duration',   label: 'Duration',       placeholder: 'e.g. 30 days',             required: false },
  ],
  diagnosis: [
    { key: 'description', label: 'Diagnosis',     placeholder: 'e.g. Type 2 Diabetes Mellitus', required: true },
    { key: 'code',        label: 'ICD-10 code',   placeholder: 'e.g. E11.9',                    required: false },
    { key: 'status',      label: 'Status',        placeholder: 'e.g. Active / Resolved',         required: false },
  ],
  lab_result: [
    { key: 'test_name',       label: 'Test name',      placeholder: 'e.g. HbA1c',               required: true },
    { key: 'value',           label: 'Result value',   placeholder: 'e.g. 7.2',                  required: true },
    { key: 'unit',            label: 'Unit',           placeholder: 'e.g. %',                    required: false },
    { key: 'reference_range', label: 'Reference range',placeholder: 'e.g. 4.0–5.6 %',           required: false },
    { key: 'flag',            label: 'Flag',           placeholder: 'HIGH / LOW / NORMAL',        required: false },
  ],
  vital_sign: [
    { key: 'type',  label: 'Vital type',  placeholder: 'e.g. Blood Pressure', required: true },
    { key: 'value', label: 'Value',       placeholder: 'e.g. 130/85',          required: true },
    { key: 'unit',  label: 'Unit',        placeholder: 'e.g. mmHg',            required: false },
  ],
  allergy: [
    { key: 'substance', label: 'Substance / Drug', placeholder: 'e.g. Penicillin', required: true },
    { key: 'reaction',  label: 'Reaction',          placeholder: 'e.g. Hives, Anaphylaxis', required: false },
    { key: 'severity',  label: 'Severity',          placeholder: 'Mild / Moderate / Severe', required: false },
  ],
  immunization: [
    { key: 'vaccine',    label: 'Vaccine',     placeholder: 'e.g. COVID-19 (Pfizer)', required: true },
    { key: 'lot_number', label: 'Lot number',  placeholder: 'Optional',               required: false },
    { key: 'site',       label: 'Site',        placeholder: 'e.g. Left deltoid',      required: false },
  ],
  procedure: [
    { key: 'name',        label: 'Procedure name', placeholder: 'e.g. Appendectomy',   required: true },
    { key: 'description', label: 'Description',    placeholder: 'Brief notes',          required: false },
    { key: 'outcome',     label: 'Outcome',        placeholder: 'e.g. Successful',      required: false },
  ],
  follow_up: [
    { key: 'instructions', label: 'Instructions',    placeholder: 'e.g. Return in 4 weeks for HbA1c recheck', required: true },
    { key: 'specialist',   label: 'Refer to',        placeholder: 'e.g. Endocrinology (optional)',             required: false },
  ],
  other: [
    { key: 'description', label: 'Description', placeholder: 'Clinical note…', required: true },
  ],
}

/* ── Input component ─────────────────────────────────────────────────────── */
function Field({ label, required, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-neutral-dark/60">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-neutral-dark placeholder-neutral-dark/30 outline-none transition focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/10"
      />
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function AddEventForm({ patientId, onSuccess }) {
  const [step, setStep] = useState('type') // 'type' | 'fields' | 'success'
  const [selectedType, setSelectedType] = useState(null)
  const [fieldValues, setFieldValues] = useState({})
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const typeConfig = EVENT_TYPES.find((t) => t.value === selectedType)
  const fields = FIELD_CONFIGS[selectedType] ?? []

  /* ── helpers ── */
  const reset = () => {
    setStep('type')
    setSelectedType(null)
    setFieldValues({})
    setEventDate(new Date().toISOString().slice(0, 10))
    setNotes('')
    setError(null)
  }

  const handleTypeSelect = (type) => {
    setSelectedType(type)
    setFieldValues({})
    setError(null)
    setStep('fields')
  }

  const handleBack = () => {
    setError(null)
    setStep('type')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validate required fields
    const missing = fields.filter((f) => f.required && !fieldValues[f.key]?.trim())
    if (missing.length) {
      setError(`Please fill in: ${missing.map((f) => f.label).join(', ')}`)
      return
    }

    setSubmitting(true)
    try {
      await axiosClient.post(`/patients/${patientId}/events`, {
        event_type: selectedType,
        event_date: eventDate || null,
        event_data: fieldValues,
        notes: notes.trim() || null,
        confidence_score: 1.0,
        ai_model: 'manual',
      })
      setStep('success')
      // Let parent know so it can refresh / regenerate summary
      setTimeout(() => {
        reset()
        onSuccess?.()
      }, 1800)
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Failed to save event. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Success screen ── */
  if (step === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </span>
        <p className="text-sm font-semibold text-neutral-dark">Event saved</p>
        <p className="text-xs text-neutral-dark/50">Regenerating summary…</p>
      </div>
    )
  }

  /* ── Type selection ── */
  if (step === 'type') {
    return (
      <div className="grid grid-cols-3 gap-2">
        {EVENT_TYPES.map(({ value, label, icon: Icon, color, bg }) => (
          <button
            key={value}
            onClick={() => handleTypeSelect(value)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition hover:shadow-md ${bg}`}
          >
            <Icon className={`h-5 w-5 ${color}`} />
            <span className={`text-[11px] font-semibold ${color}`}>{label}</span>
          </button>
        ))}
      </div>
    )
  }

  /* ── Field entry ── */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        {typeConfig && <typeConfig.icon className={`h-4 w-4 ${typeConfig.color}`} />}
        <p className="text-sm font-semibold text-neutral-dark">{typeConfig?.label}</p>
        <button
          type="button"
          onClick={handleBack}
          className="ml-auto text-[11px] font-medium text-primary hover:underline"
        >
          ← Change type
        </button>
      </div>

      {/* Structured fields */}
      {fields.map((f) => (
        <Field
          key={f.key}
          label={f.label}
          required={f.required}
          value={fieldValues[f.key] ?? ''}
          onChange={(v) => setFieldValues((prev) => ({ ...prev, [f.key]: v }))}
          placeholder={f.placeholder}
        />
      ))}

      {/* Date */}
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-neutral-dark/60">
          Date
        </label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-neutral-dark outline-none transition focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-neutral-dark/60">
          Notes <span className="font-normal normal-case text-neutral-dark/40">(optional)</span>
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional clinical notes…"
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-neutral-dark placeholder-neutral-dark/30 outline-none transition focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
        ) : (
          <><Plus className="h-4 w-4" /> Add to Patient Record</>
        )}
      </button>
    </form>
  )
}
