import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, Clock3, Loader2, Moon, Sun } from 'lucide-react'
import axiosClient from '../api/axiosClient'
import Button from '../components/Button'
import { useToastContext } from '../context/ToastContext'
import { useAuth } from '../hooks/useAuth'

const WEEK_DAYS = [
  { label: 'Monday', dayOfWeek: 1 },
  { label: 'Tuesday', dayOfWeek: 2 },
  { label: 'Wednesday', dayOfWeek: 3 },
  { label: 'Thursday', dayOfWeek: 4 },
  { label: 'Friday', dayOfWeek: 5 },
  { label: 'Saturday', dayOfWeek: 6 },
  { label: 'Sunday', dayOfWeek: 0 },
]

const createEmptySchedule = () =>
  WEEK_DAYS.reduce((map, day) => {
    map[day.dayOfWeek] = {
      dayOfWeek: day.dayOfWeek,
      label: day.label,
      isClosed: true,
      openTime: '09:00',
      closeTime: '17:00',
    }
    return map
  }, {})

// Handles plain "HH:MM", "HH:MM:SS", or ISO datetime "1970-01-01T08:00:00.000Z"
const formatTimeInput = (value) => {
  if (!value) return ''
  const str = String(value)
  const tIdx = str.indexOf('T')
  if (tIdx !== -1) return str.slice(tIdx + 1, tIdx + 6)
  return str.slice(0, 5)
}
// Ensure we send exactly HH:MM:SS – never double-append :00
const formatTimeForApi = (value) => {
  if (!value) return null
  const str = String(value).trim()
  if (str.length <= 5) return `${str}:00` // HH:MM → HH:MM:00
  return str.slice(0, 8)            // already HH:MM:SS
}

export default function ClinicHoursSettingsPage() {
  const { user } = useAuth()
  const receptionistClinicId = useMemo(
    () => user?.receptionClinicId ?? user?.receptionClinic?.id ?? user?.clinicId ?? null,
    [user],
  )
  const [clinics, setClinics] = useState([])
  const [selectedClinicId, setSelectedClinicId] = useState(null)
  const [schedule, setSchedule] = useState(() => createEmptySchedule())
  const [loadingClinics, setLoadingClinics] = useState(true)
  const [loadingHours, setLoadingHours] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const { notify } = useToastContext()

  const selectedClinic = useMemo(
    () => clinics.find((clinic) => clinic.id === selectedClinicId) ?? null,
    [clinics, selectedClinicId],
  )

  useEffect(() => {
    let isMounted = true
    setLoadingClinics(true)
    axiosClient
      .get('/clinics')
      .then((response) => {
        if (!isMounted) return
        const data = response.data?.data || response.data || []
        const filtered = receptionistClinicId
          ? data.filter((clinic) => clinic.id === receptionistClinicId)
          : data
        setClinics(filtered)
        if (filtered.length) {
          setSelectedClinicId((current) => current ?? filtered[0].id)
        }
      })
      .catch((err) => {
        console.error('Unable to load clinics', err)
        if (isMounted) {
          setError('Unable to fetch clinics right now.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingClinics(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [receptionistClinicId])

  useEffect(() => {
    if (!selectedClinicId) return
    let isMounted = true
    setLoadingHours(true)
    setError(null)
    axiosClient
      .get(`/clinics/${selectedClinicId}/hours`)
      .then((response) => {
        if (!isMounted) return
        const data = response.data?.data || response.data || []
        const normalized = createEmptySchedule()
        data.forEach((item) => {
          normalized[item.dayOfWeek] = {
            dayOfWeek: item.dayOfWeek,
            label: normalized[item.dayOfWeek]?.label ?? 'Day',
            isClosed: Boolean(item.isClosed),
            openTime: formatTimeInput(item.openTime),
            closeTime: formatTimeInput(item.closeTime),
          }
        })
        setSchedule(normalized)
      })
      .catch((err) => {
        console.error('Failed to load clinic hours', err)
        if (isMounted) {
          setError('Could not load working hours for the selected clinic.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingHours(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [selectedClinicId])

  const handleToggleDay = (dayOfWeek) => {
    setSchedule((prev) => {
      const entry = prev[dayOfWeek]
      return {
        ...prev,
        [dayOfWeek]: {
          ...entry,
          isClosed: !entry.isClosed,
        },
      }
    })
  }

  const handleTimeChange = (dayOfWeek, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    if (!selectedClinicId) return
    setSaving(true)
    setError(null)
    try {
      for (const day of WEEK_DAYS) {
        const entry = schedule[day.dayOfWeek]
        if (!entry) continue
        if (!entry.isClosed && (!entry.openTime || !entry.closeTime)) {
          throw new Error(`Please set both open and close time for ${day.label}.`)
        }
      }

      const requests = WEEK_DAYS.map((day) => {
        const entry = schedule[day.dayOfWeek]
        return axiosClient.post(`/clinics/${selectedClinicId}/hours`, {
          dayOfWeek: day.dayOfWeek,
          isClosed: entry?.isClosed ?? true,
          openTime: entry?.isClosed ? null : formatTimeForApi(entry.openTime),
          closeTime: entry?.isClosed ? null : formatTimeForApi(entry.closeTime),
        })
      })
      await Promise.all(requests)
      notify({ message: 'Clinic hours saved', type: 'success' })
    } catch (err) {
      console.error('Failed to save clinic hours', err)
      const message = err?.response?.data?.message || err?.message || 'Could not save clinic hours.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          <CalendarClock className="h-4 w-4 text-primary" />
          Receptionist Settings
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Clinic Working Hours</h1>
            <p className="text-sm text-slate-500">Control when your clinic opens each day of the week.</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Clinic</label>
            {receptionistClinicId ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                {clinics[0]?.name ?? 'Your clinic'}
              </div>
            ) : (
              <select
                id="clinic-select"
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/40"
                value={selectedClinicId ?? ''}
                onChange={(event) => {
                  const nextId = event.target.value ? Number(event.target.value) : null
                  setSelectedClinicId(nextId)
                }}
                disabled={loadingClinics}
              >
                {clinics.length === 0 ? (
                  <option value="">
                    {loadingClinics ? 'Loading clinics…' : 'No clinics available'}
                  </option>
                ) : (
                  clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loadingHours ? (
          <div className="col-span-full rounded-3xl border border-slate-100 bg-white/80 p-8 text-center text-sm text-slate-500 shadow-md">
            Loading working hours…
          </div>
        ) : (
          WEEK_DAYS.map((day) => {
            const entry = schedule[day.dayOfWeek]
            const isClosed = entry?.isClosed ?? true
            return (
              <div key={day.dayOfWeek} className="space-y-3 rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-[0px_25px_45px_-35px_rgba(15,23,42,0.5)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{day.label}</p>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Day {day.dayOfWeek}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleDay(day.dayOfWeek)}
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-1 text-xs font-semibold transition ${
                      isClosed ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-primary bg-primary/10 text-primary'
                    }`}
                  >
                    {isClosed ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    {isClosed ? 'Closed' : 'Open'}
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Open time</label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-slate-400" />
                      <input
                        type="time"
                        step="60"
                        value={entry?.openTime ?? '09:00'}
                        onChange={(event) => handleTimeChange(day.dayOfWeek, 'openTime', event.target.value)}
                        disabled={isClosed}
                        className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Close time</label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-slate-400" />
                      <input
                        type="time"
                        step="60"
                        value={entry?.closeTime ?? '17:00'}
                        onChange={(event) => handleTimeChange(day.dayOfWeek, 'closeTime', event.target.value)}
                        disabled={isClosed}
                        className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-600">{selectedClinic ? `Managing ${selectedClinic.name}` : 'Select a clinic to configure its hours.'}</p>
          <p className="text-xs text-slate-400">Changes will take effect immediately after saving.</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={saving || !selectedClinicId || loadingHours}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save working hours'
          )}
        </Button>
      </div>
    </section>
  )
}
