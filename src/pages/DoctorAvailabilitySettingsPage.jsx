import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarClock, Clock3, Loader2, Plus, X } from 'lucide-react'
import axiosClient from '../api/axiosClient'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { useToastContext } from '../context/ToastContext'

const WEEK_DAYS = [
  { label: 'Monday', dayOfWeek: 1 },
  { label: 'Tuesday', dayOfWeek: 2 },
  { label: 'Wednesday', dayOfWeek: 3 },
  { label: 'Thursday', dayOfWeek: 4 },
  { label: 'Friday', dayOfWeek: 5 },
  { label: 'Saturday', dayOfWeek: 6 },
  { label: 'Sunday', dayOfWeek: 0 },
]

const createEmptySlotsMap = () =>
  WEEK_DAYS.reduce((map, day) => {
    map[day.dayOfWeek] = []
    return map
  }, {})

// Handles plain "HH:MM", "HH:MM:SS", or ISO datetime "1970-01-01T08:00:00.000Z"
const formatTimeForDisplay = (value) => {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString().slice(11, 16)
  const str = String(value)
  const tIdx = str.indexOf('T')
  if (tIdx !== -1) return str.slice(tIdx + 1, tIdx + 6)
  return str.slice(0, 5)
}

const formatTimeForApi = (value) => (value ? `${value}:00` : null)

const parseTimeToMinutes = (value) => {
  if (!value) return null
  const [hours, minutes] = value.split(':').map((segment) => Number(segment))
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

const sortSlotsByStart = (entries) =>
  [...entries].sort((a, b) => {
    const aMinutes = parseTimeToMinutes(a.startTime) ?? 0
    const bMinutes = parseTimeToMinutes(b.startTime) ?? 0
    return aMinutes - bMinutes
  })

const createEmptyHoursMap = () =>
  WEEK_DAYS.reduce((map, day) => {
    map[day.dayOfWeek] = { openMinutes: null, closeMinutes: null, isClosed: false }
    return map
  }, {})

const NETWORK_ERROR_MESSAGE = 'Network error. Please check your connection and try again.'

const getFriendlyErrorMessage = (error, fallback) => {
  if (!error) return fallback
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message?.toLowerCase().includes('network')) return NETWORK_ERROR_MESSAGE
  return fallback
}

const isWithinClinicHours = (hours, startMinutes, endMinutes) => {
  if (!hours) return true
  if (hours.isClosed) return false
  if (hours.openMinutes === null || hours.closeMinutes === null) return true
  return startMinutes >= hours.openMinutes && endMinutes <= hours.closeMinutes
}

const hasOverlap = (slots, candidate) => {
  const candidateStart = parseTimeToMinutes(candidate.startTime)
  const candidateEnd = parseTimeToMinutes(candidate.endTime)
  if (candidateStart === null || candidateEnd === null) return false
  return slots.some((slot) => {
    const start = parseTimeToMinutes(slot.startTime)
    const end = parseTimeToMinutes(slot.endTime)
    if (start === null || end === null) {
      return false
    }
    return candidateStart < end && start < candidateEnd
  })
}

const DEFAULT_MODAL_STATE = {
  isOpen: false,
  day: null,
  startTime: '08:00',
  endTime: '17:00',
  error: null,
  isSubmitting: false,
}

function TimeSlotModal({ state, onClose, onStartChange, onEndChange, onSubmit }) {
  if (!state.isOpen || !state.day) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-time-slot"
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Add time slot</p>
            <h3 id="add-time-slot" className="text-lg font-semibold text-slate-900">
              {state.day.label}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-1 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              Start time
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Clock3 className="h-4 w-4 text-slate-400" />
              <input
                type="time"
                value={state.startTime}
                onChange={(event) => onStartChange(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              End time
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Clock3 className="h-4 w-4 text-slate-400" />
              <input
                type="time"
                value={state.endTime}
                onChange={(event) => onEndChange(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        {state.error && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            <AlertTriangle className="h-4 w-4" />
            {state.error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="px-4">
            Cancel
          </Button>
          <Button onClick={onSubmit} className="px-4" disabled={state.isSubmitting}>
            {state.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add to day
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DoctorAvailabilitySettingsPage() {
  const { user } = useAuth()
  const { notify } = useToastContext()
  const doctorId = user?.doctorId ?? user?.doctor?.id
  const clinicId = user?.doctor?.clinicId ?? user?.doctor?.clinic?.id

  const [slotsByDay, setSlotsByDay] = useState(() => createEmptySlotsMap())
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [modalState, setModalState] = useState(DEFAULT_MODAL_STATE)
  const [deletingSlotIds, setDeletingSlotIds] = useState(() => new Set())
  const [actionError, setActionError] = useState(null)
  const [clinicHours, setClinicHours] = useState(() => createEmptyHoursMap())
  const [hoursError, setHoursError] = useState(null)
  const [savingSchedule, setSavingSchedule] = useState(false)

  const hasSlotsForSave = useMemo(
    () => WEEK_DAYS.some((day) => (slotsByDay[day.dayOfWeek] ?? []).length > 0),
    [slotsByDay],
  )

  const loadAvailability = useCallback(async () => {
    if (!doctorId) {
      setLoading(false)
      return { success: false, errorMessage: null }
    }

    setFetchError(null)
    setLoading(true)

    let result = { success: true, errorMessage: null }
    try {
      const response = await axiosClient.get(`/doctors/${doctorId}/availability`)
      const responseData = response.data?.data || response.data || []
      const normalized = createEmptySlotsMap()

      responseData.forEach((slot) => {
        const daySlots = normalized[slot.dayOfWeek] ?? []
        daySlots.push({
          id: slot.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: formatTimeForDisplay(slot.startTime),
          endTime: formatTimeForDisplay(slot.endTime),
        })
      })

      WEEK_DAYS.forEach((day) => {
        normalized[day.dayOfWeek] = sortSlotsByStart(normalized[day.dayOfWeek] ?? [])
      })

      setSlotsByDay(normalized)
      setDeletingSlotIds(new Set())
    } catch (error) {
      result = {
        success: false,
        errorMessage: getFriendlyErrorMessage(
          error,
          'Unable to load your availability right now. Please try again later.',
        ),
      }
      console.error('Unable to load doctor availability', error)
      setFetchError(result.errorMessage)
    } finally {
      setLoading(false)
    }

    return result
  }, [doctorId])

  useEffect(() => {
    loadAvailability()
  }, [loadAvailability])

  const loadClinicHours = useCallback(async () => {
    if (!clinicId) {
      setClinicHours(createEmptyHoursMap())
      return
    }

    setHoursError(null)
    try {
      const response = await axiosClient.get(`/clinics/${clinicId}/hours`)
      const responseData = response.data?.data || response.data || []
      const normalized = createEmptyHoursMap()

      responseData.forEach((item) => {
        const startMinutes = parseTimeToMinutes(formatTimeForDisplay(item.openTime))
        const endMinutes = parseTimeToMinutes(formatTimeForDisplay(item.closeTime))
        normalized[item.dayOfWeek] = {
          openMinutes: startMinutes,
          closeMinutes: endMinutes,
          isClosed: Boolean(item.isClosed),
        }
      })

      setClinicHours(normalized)
    } catch (error) {
      console.error('Unable to load clinic hours', error)
      setHoursError(getFriendlyErrorMessage(error, 'Unable to load clinic hours. Please try again later.'))
    }
  }, [clinicId])

  useEffect(() => {
    loadClinicHours()
  }, [loadClinicHours])

  const openModalForDay = (day) => {
    setModalState({
      isOpen: true,
      day,
      startTime: '08:00',
      endTime: '17:00',
      error: null,
      isSubmitting: false,
    })
  }

  const closeModal = () => {
    setModalState({ ...DEFAULT_MODAL_STATE })
  }

  const handleModalSave = () => {
    if (!modalState.day) return

    const { startTime, endTime, day } = modalState
    const startMinutes = parseTimeToMinutes(startTime)
    const endMinutes = parseTimeToMinutes(endTime)

    if (startMinutes === null || endMinutes === null) {
      setModalState((prev) => ({ ...prev, error: 'Please enter both start and end times.' }))
      return
    }

    if (endMinutes <= startMinutes) {
      setModalState((prev) => ({ ...prev, error: 'End time must be after start time.' }))
      return
    }

    const existingSlots = slotsByDay[day.dayOfWeek] ?? []
    if (hasOverlap(existingSlots, { startTime, endTime })) {
      setModalState((prev) => ({ ...prev, error: 'This time range overlaps with another slot.' }))
      return
    }

    const dayHours = clinicHours[day.dayOfWeek]
    if (!isWithinClinicHours(dayHours, startMinutes, endMinutes)) {
      const message = dayHours?.isClosed
        ? 'Clinic is closed on this day. Choose another day or update the clinic hours first.'
        : 'Time slots must fall within the clinic working hours.'
      setModalState((prev) => ({ ...prev, error: message }))
      return
    }

    if (!doctorId || !clinicId) {
      setModalState((prev) => ({ ...prev, error: 'Missing doctor or clinic context.' }))
      return
    }

    setModalState((prev) => ({ ...prev, isSubmitting: true, error: null }))

    axiosClient
      .post(`/doctors/${doctorId}/availability`, {
        dayOfWeek: day.dayOfWeek,
        startTime: formatTimeForApi(startTime),
        endTime: formatTimeForApi(endTime),
        clinicId,
      })
      .then((response) => {
        const payload = response.data?.data || response.data
        const newSlot = {
          id: payload?.id,
          dayOfWeek: payload?.dayOfWeek ?? day.dayOfWeek,
          startTime: formatTimeForDisplay(payload?.startTime) || startTime,
          endTime: formatTimeForDisplay(payload?.endTime) || endTime,
        }
        setSlotsByDay((prev) => ({
          ...prev,
          [day.dayOfWeek]: sortSlotsByStart([...(prev[day.dayOfWeek] ?? []), newSlot]),
        }))
        notify({ type: 'success', message: 'Slot added.' })
        setActionError(null)
        closeModal()
      })
      .catch((error) => {
        console.error('Unable to add slot', error)
        const message = error?.response?.data?.message || 'Unable to add slot now.'
        setModalState((prev) => ({ ...prev, error: message, isSubmitting: false }))
        setActionError(message)
        notify({ type: 'error', message })
      })
      .finally(() => {
        setModalState((prev) => ({ ...prev, isSubmitting: false }))
      })
  }

  const handleSlotDelete = (dayOfWeek, slot) => {
    if (!slot.id) return
    setDeletingSlotIds((prev) => {
      const next = new Set(prev)
      next.add(slot.id)
      return next
    })

    axiosClient
      .delete(`/doctors/${doctorId}/availability/${slot.id}`)
      .then(() => {
        setSlotsByDay((prev) => ({
          ...prev,
          [dayOfWeek]: (prev[dayOfWeek] ?? []).filter((entry) => entry.id !== slot.id),
        }))
        notify({ type: 'success', message: 'Slot removed.' })
        setActionError(null)
      })
      .catch((error) => {
        console.error('Unable to delete slot', error)
        const message = error?.response?.data?.message || 'Unable to delete slot now.'
        setActionError(message)
        notify({ type: 'error', message })
      })
      .finally(() => {
        setDeletingSlotIds((prev) => {
          const next = new Set(prev)
          next.delete(slot.id)
          return next
        })
      })
  }

  const handleSave = async () => {
    if (savingSchedule || loading) return
    if (!hasSlotsForSave) {
      const message = 'Add at least one time slot before saving your availability.'
      setActionError(message)
      notify({ type: 'error', message })
      return
    }

    setSavingSchedule(true)
    setActionError(null)
    const result = await loadAvailability()
    if (result.success) {
      notify({ type: 'success', message: 'Availability refreshed.' })
    } else {
      const message = result.errorMessage || 'Unable to save your availability right now.'
      setActionError(message)
      notify({ type: 'error', message })
    }
    setSavingSchedule(false)
  }

  const sortedSlots = useMemo(
    () =>
      WEEK_DAYS.reduce((acc, day) => {
        acc[day.dayOfWeek] = sortSlotsByStart(slotsByDay[day.dayOfWeek] ?? [])
        return acc
      }, {}),
    [slotsByDay],
  )
  if (!doctorId) {
    return (
      <section className="space-y-6">
        <header className="flex flex-col gap-2 rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            <CalendarClock className="h-4 w-4 text-primary" />
            Doctor Availability
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Doctor availability</h1>
            <p className="text-sm text-slate-500">Connect your account to a doctor profile before managing slots.</p>
          </div>
        </header>
        <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 text-sm text-slate-600 shadow-xl">
          We could not detect a doctor profile for you. Please contact your administrator if this is unexpected.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          <CalendarClock className="h-4 w-4 text-primary" />
          Doctor Availability
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Shape your weekly cadence</h1>
            <p className="text-sm text-slate-500">Add or remove time ranges for each day. Save once you are ready.</p>
          </div>
          <p className="text-xs text-slate-400">All ranges are relative to your clinic timezone.</p>
        </div>
      </header>

      {fetchError && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {fetchError}
        </div>
      )}

      {hoursError && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertTriangle className="h-4 w-4" />
          {hoursError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? WEEK_DAYS.map((day) => (
              <div
                key={day.dayOfWeek}
                className="h-60 animate-pulse rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-lg"
              ></div>
            ))
          : WEEK_DAYS.map((day) => {
              const daySlots = sortedSlots[day.dayOfWeek] ?? []

              return (
                <article
                  key={day.dayOfWeek}
                  className="flex h-full flex-col justify-between rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">{day.label}</p>
                        <p className="text-xs text-slate-400">Day {day.dayOfWeek}</p>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => openModalForDay(day)}
                        disabled={!clinicId}
                        className="text-xs px-3 py-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add slot
                      </Button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {!daySlots.length && (
                        <p className="rounded-2xl border border-dashed border-slate-200 px-3 py-4 text-xs uppercase tracking-[0.3em] text-slate-400">
                          No slots yet
                        </p>
                      )}

                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                        >
                          <span className="font-semibold text-slate-700">
                            {slot.startTime} → {slot.endTime}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSlotDelete(day.dayOfWeek, slot)}
                            className={`text-xs font-semibold uppercase tracking-[0.3em] ${deletingSlotIds.has(slot.id) ? 'text-slate-400' : 'text-red-600'}`}
                            disabled={deletingSlotIds.has(slot.id)}
                          >
                            {deletingSlotIds.has(slot.id) ? (
                              <Loader2 className="h-3.5 w-3.5" />
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">
              Save ensures the interface refreshes once you finish managing slots.
            </p>
            {!hasSlotsForSave && (
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
                Add at least one slot before saving.
              </p>
            )}
            {!clinicId && (
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
                Connect to a clinic before saving.
              </p>
            )}
          </div>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={savingSchedule || loading || !hasSlotsForSave || !clinicId}
          >
            {savingSchedule ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              'Save schedule'
            )}
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertTriangle className="h-4 w-4" /> {actionError}
        </div>
      )}

      <TimeSlotModal
        state={modalState}
        onClose={closeModal}
        onStartChange={(value) => setModalState((prev) => ({ ...prev, startTime: value }))}
        onEndChange={(value) => setModalState((prev) => ({ ...prev, endTime: value }))}
        onSubmit={handleModalSave}
      />
    </section>
  )
}
