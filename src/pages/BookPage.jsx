import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stethoscope, CalendarDays, Loader2, AlertCircle, CheckCircle2, ChevronRight, Ticket, ArrowRight, User } from 'lucide-react'
import Button from '../components/Button'
import axiosClient from '../api/axiosClient'
import { DOCTORS } from '../data/doctors'
import { useToast } from '../hooks/useToast'

export default function BookPage() {
  const navigate = useNavigate()
  const [doctorId, setDoctorId] = useState(DOCTORS[0]?.id || '')
  const [date, setDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const { notify } = useToast()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      // Simulate API call or use real one
      const response = await axiosClient.post('/appointments', { doctorId, date })
      setConfirmation(response.data)
      notify({ type: 'success', message: `Appointment booked (token ${response.data.token})` })
      setTimeout(() => navigate('/queue', { replace: true }), 2000)
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Unable to book appointment right now.'
      setError(msg)
      notify({ type: 'error', message: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (confirmation) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center animate-fade-in py-12">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-glow shadow-emerald-500/20">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-heading font-bold text-slate-800">Booking Confirmed!</h2>
        <p className="mt-2 text-slate-500 max-w-md">Your appointment has been successfully scheduled.</p>
        
        <div className="mt-8 w-full max-w-sm rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden relative group">
          <div className="h-2 bg-gradient-to-r from-primary to-accent w-full absolute top-0" />
          <div className="p-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Token Number</p>
            <p className="text-5xl font-black text-slate-800 mt-2 tracking-tighter group-hover:scale-110 transition-transform duration-300">{confirmation.token}</p>
            
            <div className="mt-8 space-y-3 pt-8 border-t border-slate-50 text-left">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                   <User className="h-4 w-4 text-slate-400" />
                   <span className="text-sm font-semibold text-slate-700">{DOCTORS.find(d => d.id === doctorId)?.name}</span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                   <CalendarDays className="h-4 w-4 text-slate-400" />
                   <span className="text-sm font-semibold text-slate-700">{date}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-slate-400 animate-pulse">Redirecting to queue...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-slate-900">New Appointment</h1>
        <p className="text-slate-500 mt-2">Fill in the details below to schedule your visit.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl space-y-8 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Doctor Selection */}
        <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                Select Specialist
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
                {DOCTORS.map((doc) => (
                    <div 
                        key={doc.id}
                        onClick={() => setDoctorId(doc.id)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 flex items-start gap-3 relative overflow-hidden ${
                            doctorId === doc.id 
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary' 
                            : 'border-slate-200 bg-white hover:border-primary/30 hover:shadow-sm'
                        }`}
                    >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${doctorId === doc.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <User className="h-5 w-5" />
                        </div>
                        <div className="relative z-10">
                            <p className={`font-bold ${doctorId === doc.id ? 'text-primary-dark' : 'text-slate-700'}`}>{doc.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{doc.specialization}</p>
                        </div>
                        {doctorId === doc.id && <div className="absolute top-2 right-2"><CheckCircle2 className="h-4 w-4 text-primary" /></div>}
                    </div>
                ))}
            </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Select Date
            </label>
            <div className="relative group">
                <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                    type="date" 
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-sm font-medium text-slate-900 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400"
                />
            </div>
        </div>

        {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 text-sm text-red-600 animate-in slide-in-from-top-2 fade-in duration-300">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p>{error}</p>
            </div>
        )}

        <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => navigate(-1)} type="button">Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !date} className="px-8 shadow-lg shadow-primary/20">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Booking'}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
        </div>
      </form>
    </div>
  )
}
