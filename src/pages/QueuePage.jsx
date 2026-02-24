import { useMemo, useState, useEffect } from 'react'
import { Hash, Users, UserCircle, Clock3, CheckCircle2, Loader2, AlertCircle, ChevronRight, MapPin } from 'lucide-react'
import Button from '../components/Button'
import axiosClient from '../api/axiosClient'
import { useQueueStatus } from '../hooks/useQueueStatus'
import { useDoctors } from '../hooks/useDoctors'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'

export default function QueuePage() {
  const { user } = useAuth()
  const { doctors, loading: loadingDoctors } = useDoctors()
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [myAppointment, setMyAppointment] = useState(null)
  
  // Fetch user's appointments to auto-select doctor
  useEffect(() => {
    const fetchMyAppointment = async () => {
      if (!user?.patientId) return
      
      try {
        const response = await axiosClient.get('/appointments', { 
          params: { upcoming: true } 
        })
        const appointments = response.data?.data || []
        if (appointments.length > 0) {
          const apt = appointments[0]
          setMyAppointment(apt)
          // Auto-select the doctor from the first appointment
          if (apt.doctorId && !selectedDoctor) {
            setSelectedDoctor(apt.doctorId.toString())
          }
        }
      } catch (err) {
        console.error('Failed to fetch appointments', err)
      }
    }
    
    fetchMyAppointment()
  }, [user?.patientId, selectedDoctor])
  
  // Set default doctor once loaded (fallback)
  useEffect(() => {
    if (!selectedDoctor && doctors.length > 0 && !myAppointment) {
      setSelectedDoctor(doctors[0].id)
    }
  }, [doctors, selectedDoctor, myAppointment])

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
              disabled={loadingDoctors}
            >
              {loadingDoctors ? (
                <option>Loading doctors...</option>
              ) : (
                doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))
              )}
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


        {/* Arrived tokens - People Inside Clinic */}
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-elevated lg:col-span-2">
          <SectionHeader icon={Users} label="People inside the clinic" color="text-emerald-600" bg="bg-emerald-50" />
          
          <div className="space-y-3">
             {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-50" />
                ))
             ) : arrivedTokens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-neutral-dark/40">
                  <Users className="h-8 w-8 opacity-20" />
                  <p className="mt-2 text-sm">No patients currently inside.</p>
                </div>
             ) : (
                arrivedTokens.slice().sort((a,b) => (a.tokenNumber || 0) - (b.tokenNumber || 0)).map((token) => (
                  <div key={token.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-sm">
                          {token.tokenNumber}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{token.patient?.name || 'Patient'}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit">
                              <CheckCircle2 className="h-3 w-3" /> Arrived
                            </span>
                            {/* Estimated wait time for this person based on position? Maybe too much detail. */}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {token.arrivalTime ? new Date(token.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </div>
                  </div>
                ))
             )}
          </div>
        </div>
      </div>

      {/* User's own appointment status (Fixed Bottom Card or Inline) */}
      {userAppointment && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 animate-slide-up z-50">
           <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                   <div className="h-14 w-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <span className="text-2xl font-bold">{userAppointment.tokenNumber}</span>
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Token</p>
                      <p className="font-semibold text-lg text-white">
                        {userAppointment.status === 'ARRIVED' ? "You've Arrived" : 
                         userAppointment.status === 'IN_CONSULTATION' ? "It's Your Turn!" :
                         "Booked"}
                      </p>
                   </div>
                </div>
                <div className="text-right">
                   {userAppointment.status === 'BOOKED' && (
                     <>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Wait</p>
                       <p className="text-xl font-mono text-emerald-400">~{((arrivedTokens.length || 0) + 1) * 15}m</p>
                     </>
                   )}
                </div>
              </div>
              
              {userAppointment.status === 'BOOKED' ? (
                <Button 
                  onClick={handleArrive} 
                  disabled={isArriving}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-transparent py-6 text-lg shadow-lg shadow-emerald-500/20"
                >
                  {isArriving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><MapPin className="h-5 w-5 mr-2" /> I Have reached Condition</>}
                </Button>
              ) : (
                <div className="w-full bg-white/5 rounded-xl p-3 text-center text-sm text-slate-300 border border-white/5">
                  {userAppointment.status === 'ARRIVED' ? "Please wait for your turn." : "Proceed to consultation room."}
                </div>
              )}
           </div>
        </div>
      )}
    </section>
  )
}

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

