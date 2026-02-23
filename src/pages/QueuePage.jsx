import { useMemo, useState } from 'react'
import { Hash, Users, UserCircle, Clock3, CheckCircle2, Loader2, AlertCircle, ChevronRight } from 'lucide-react'
import Button from '../components/Button'
import axiosClient from '../api/axiosClient'
import { useQueueStatus } from '../hooks/useQueueStatus'
import { useToast } from '../hooks/useToast'
import { DOCTORS } from '../data/doctors'

export default function QueuePage() {
  const [selectedDoctor, setSelectedDoctor] = useState(DOCTORS[0].id)
  const { data, loading, error, refresh } = useQueueStatus(selectedDoctor)
  const [statusMessage, setStatusMessage] = useState(null)
  const [isArriving, setIsArriving] = useState(false)
  const { notify } = useToast()

  const arrivedTokens = data?.arrivedTokens ?? []
  const userAppointment = data?.userAppointment
  const arrivedBefore = useMemo(() => {
    if (!userAppointment) return 0
    return Math.max((userAppointment.position ?? 1) - 1, 0)
  }, [userAppointment])

  const handleArrive = async () => {
    if (!userAppointment) return
    setIsArriving(true)
    setStatusMessage(null)
    try {
      await axiosClient.put(`/appointments/${userAppointment.id}/arrive`)
      notify({ type: 'success', message: 'Arrival recorded, updating queue.' })
      await refresh()
      setStatusMessage('Queue updated.')
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Unable to update arrival status.'
      setStatusMessage(msg)
      notify({ type: 'error', message: msg })
    } finally {
      setIsArriving(false)
    }
  }

  return (
    <section className="space-y-6">

      {/* Page header */}
      <div className="rounded-3xl bg-white p-6 shadow-elevated">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary/50">Queue</p>
        <h2 className="mt-1 text-2xl font-semibold text-neutral-dark">Queue status by doctor</h2>
        <p className="mt-0.5 text-sm text-neutral-dark/50">Monitor arrivals, view the active token, and keep patients moving.</p>

        <div className="mt-5 space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-dark/50">Select doctor</label>
          <div className="relative">
            <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-dark/30" />
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full max-w-xs appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-medium text-neutral-dark transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              {DOCTORS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <ChevronRight className="pointer-events-none absolute left-[calc(min(100%,20rem)-1.75rem)] top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-neutral-dark/30" />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">

        {/* Current token */}
        <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-elevated">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-status-in-consultation/10">
              <Hash className="h-4 w-4 text-status-in-consultation" />
            </span>
            <p className="text-sm font-semibold text-neutral-dark">Current token</p>
          </div>
          <div>
            <p className="text-5xl font-bold tabular-nums text-neutral-dark">
              {loading ? <span className="text-neutral-dark/20">—</span> : (data?.currentToken ?? '—')}
            </p>
            <p className="mt-1.5 text-xs text-neutral-dark/50">currently in consultation</p>
          </div>
          <div className="mt-auto rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-dark/40">Total arrived</p>
            <p className="text-2xl font-bold tabular-nums text-neutral-dark">
              {loading ? '' : data?.totalArrived ?? 0}
            </p>
          </div>
        </div>

        {/* Arrived tokens */}
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-elevated">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-status-arrived/10">
              <Users className="h-4 w-4 text-status-arrived" />
            </span>
            <p className="text-sm font-semibold text-neutral-dark">Arrived tokens</p>
          </div>
          <div className="space-y-2">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />
                ))
              : arrivedTokens.length === 0
              ? <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-neutral-dark/50">No arrived patients yet.</p>
              : arrivedTokens.map((t) => (
                  <div key={t.token} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                    <span className="text-sm font-bold text-neutral-dark">{t.token}</span>
                    <span className="text-xs text-neutral-dark/50">{t.patientName}</span>
                  </div>
                ))}
          </div>
        </div>

        {/* My appointment */}
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-elevated">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <UserCircle className="h-4 w-4 text-primary" />
            </span>
            <p className="text-sm font-semibold text-neutral-dark">My appointment</p>
          </div>

          {userAppointment ? (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Your token</p>
                <p className="text-3xl font-bold text-primary">{userAppointment.token}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-dark/40">Ahead</p>
                  <p className="text-lg font-bold text-neutral-dark">{arrivedBefore}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <Clock3 className="h-3 w-3 text-accent" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-dark/40">Wait</p>
                  </div>
                  <p className="text-lg font-bold text-neutral-dark">{userAppointment.estimatedWaitMinutes ?? '—'}<span className="text-xs font-normal text-neutral-dark/50"> min</span></p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleArrive}
                disabled={isArriving || loading}
              >
                {isArriving ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />Recording</>
                ) : (
                  <><CheckCircle2 className="h-3.5 w-3.5" />I Have Arrived</>
                )}
              </Button>

              {statusMessage && (
                <p className="flex items-center gap-1.5 text-xs text-neutral-dark/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {statusMessage}
                </p>
              )}
            </div>
          ) : (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-neutral-dark/50">No appointment found for the selected doctor.</p>
          )}
        </div>

      </div>
    </section>
  )
}
