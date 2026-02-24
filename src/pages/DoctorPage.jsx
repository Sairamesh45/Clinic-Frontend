import { useMemo, useState } from 'react'
import { Stethoscope, UserCheck, CalendarClock, PhoneIncoming, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import Button from '../components/Button'
import axiosClient from '../api/axiosClient'
import { useDoctorAppointments } from '../hooks/useDoctorAppointments'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'

function SectionHeader({ icon: Icon, label, color = 'text-primary', bg = 'bg-primary/10' }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
      <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </span>
      <p className="text-sm font-semibold text-neutral-dark">{label}</p>
    </div>
  )
}

export default function DoctorPage() {
  const { user } = useAuth()
  const { appointments, loading, error, refresh } = useDoctorAppointments()
  const [statusMessage, setStatusMessage] = useState(null)
  const [isCallingNext, setIsCallingNext] = useState(false)
  const [isCompleting, setIsCompleting] = useState(null)
  const { notify } = useToast()

  const inConsultation = useMemo(
    () => (appointments || []).filter((a) => a.status === 'IN_CONSULTATION'),
    [appointments],
  )
  const arrived = useMemo(
    () => (appointments || []).filter((a) => a.status === 'ARRIVED').slice().sort((a, b) => (a.tokenNumber || a.token || '').toString().localeCompare((b.tokenNumber || b.token || '').toString(), undefined, { numeric: true })),
    [appointments],
  )
  const booked = useMemo(
    () => (appointments || []).filter((a) => a.status === 'BOOKED'),
    [appointments],
  )

  const handleCallNext = async () => {
    setIsCallingNext(true)
    setStatusMessage(null)
    try {
      await axiosClient.post(`/appointments/${user?.doctorId}/next`)
      notify({ type: 'success', message: 'Called the next patient in line.' })
      await refresh()
      setStatusMessage('Next patient called.')
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Unable to call next patient right now.'
      setStatusMessage(msg)
      notify({ type: 'error', message: msg })
    } finally {
      setIsCallingNext(false)
    }
  }

  const handleComplete = async (id) => {
    setIsCompleting(id)
    setStatusMessage(null)
    try {
      await axiosClient.put(`/appointments/${id}/complete`)
      notify({ type: 'success', message: 'Appointment marked complete.' })
      await refresh()
      setStatusMessage('Appointment completed.')
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Unable to mark appointment complete.'
      setStatusMessage(msg)
      notify({ type: 'error', message: msg })
    } finally {
      setIsCompleting(null)
    }
  }

  return (
    <section className="space-y-6">

      {/* Page header */}
      <div className="rounded-3xl bg-white p-6 shadow-elevated">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary/50">Doctor</p>
        <h2 className="mt-1 text-2xl font-semibold text-neutral-dark">Today&apos;s appointments</h2>
        <p className="mt-0.5 text-sm text-neutral-dark/50">Monitor arrivals, rounds, and completion for your queue.</p>

        <div className="mt-5 flex justify-end">
          <Button onClick={handleCallNext} disabled={isCallingNext || loading} aria-busy={isCallingNext || loading}>
            {isCallingNext ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />Calling next</>
            ) : (
              <><PhoneIncoming className="h-3.5 w-3.5" />Call Next Patient</>
            )}
          </Button>
        </div>

        {statusMessage && (
          <p className="mt-3 flex items-center gap-2 text-xs font-medium text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {statusMessage}
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">

        {/* In consultation */}
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-elevated">
          <SectionHeader icon={Stethoscope} label="In Consultation" color="text-status-in-consultation" bg="bg-status-in-consultation/10" />
          {loading && <p className="text-sm text-neutral-dark/40">Refreshing</p>}
          {!loading && !inConsultation.length && (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-neutral-dark/50">No active consultations right now.</p>
          )}
          {inConsultation.map((appt) => (
            <div key={appt.id} className="rounded-2xl border border-status-in-consultation/15 bg-status-in-consultation/5 p-4">
              <p className="text-sm font-semibold text-neutral-dark">{appt.patientName}</p>
              <p className="mt-0.5 text-xs text-neutral-dark/50">Token {appt.token}</p>
              <Button
                variant="secondary"
                className="mt-3 w-full"
                onClick={() => handleComplete(appt.id)}
                disabled={isCompleting === appt.id}
              >
                {isCompleting === appt.id ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />Completing</>
                ) : (
                  <><CheckCircle2 className="h-3.5 w-3.5" />Mark Completed</>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Arrived */}
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-elevated">
          <SectionHeader icon={UserCheck} label="Arrived" color="text-status-arrived" bg="bg-status-arrived/10" />
          {loading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />)}</div>}
          {!loading && !arrived.length && (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-neutral-dark/50">No arrived patients yet.</p>
          )}
          <div className="space-y-2">
            {arrived.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-dark">Token {appt.token}</p>
                  <p className="text-xs text-neutral-dark/50">{appt.patientName}</p>
                </div>
                <span className="rounded-full bg-status-arrived/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-status-arrived">Arrived</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booked */}
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-elevated">
          <SectionHeader icon={CalendarClock} label="Booked" color="text-status-booked" bg="bg-status-booked/10" />
          {loading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div>}
          {!loading && !booked.length && (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-neutral-dark/50">No upcoming bookings.</p>
          )}
          <div className="space-y-2">
            {booked.map((appt) => (
              <div key={appt.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-neutral-dark">Token {appt.token}</p>
                <p className="text-xs text-neutral-dark/50">{appt.patientName}</p>
                {appt.scheduledAt && <p className="mt-1 text-[10px] text-neutral-dark/40">{appt.scheduledAt}</p>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
