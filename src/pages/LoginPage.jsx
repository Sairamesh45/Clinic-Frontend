import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Activity, Mail, Lock, Phone, AlertCircle, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { APP_NAME, COPYRIGHT_YEAR, COPYRIGHT_OWNER, DEMO_ACCOUNTS } from '../config/appConfig'

const ROLE_REDIRECTS = {
  patient: '/dashboard',
  doctor: '/doctor',
  reception: '/queue',
}

// Demo accounts are provided via Vite env (VITE_DEMO_ACCOUNTS) and loaded from config

export default function LoginPage() {
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const role = await login({ identifier, password, phoneNumber })
      navigate(ROLE_REDIRECTS[role] || '/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background font-sans text-slate-900">
      {/* Left Panel - Branding */}
      <div className="relative hidden w-[45%] flex-col overflow-hidden bg-slate-900 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark to-primary opacity-90" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-between p-16">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                <Activity className="h-6 w-6 text-white" />
             </div>
             <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
          </div>

          <div className="space-y-6">
            <h1 className="font-heading text-4xl font-bold leading-tight">
              Modern healthcare <br />
              <span className="text-white/80">management simplified.</span>
            </h1>
            <p className="max-w-md text-lg text-white/60">
              Streamline your clinic operations, manage appointments, and provide better care for your patients.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
               {DEMO_ACCOUNTS && DEMO_ACCOUNTS.length > 0 && (
                 <>
                   <p className="mb-4 text-xs font-bold uppercase tracking-wider text-white/40">Quick Demo Access</p>
                   <div className="space-y-3">
                     {DEMO_ACCOUNTS.map((acc) => (
                       <button
                         key={acc.role}
                         onClick={() => {
                           setIdentifier(acc.email)
                           if (acc.password) setPassword(acc.password)
                         }}
                         className="group flex w-full items-center justify-between rounded-lg p-2 hover:bg-white/5 text-left transition-colors"
                       >
                         <div>
                           <p className="text-sm font-semibold text-white group-hover:text-primary-light transition-colors">{acc.role}</p>
                           <p className="text-xs text-white/50">{acc.email}</p>
                         </div>
                         <ArrowRight className="h-4 w-4 text-white/20 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                       </button>
                     ))}
                   </div>
                 </>
               )}
            </div>
            <p className="text-xs text-white/30">© {COPYRIGHT_YEAR} {COPYRIGHT_OWNER}</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
           <div className="text-center lg:text-left">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary lg:mx-0 lg:hidden">
                 <Activity className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
              <p className="text-slate-500 mt-2">Please sign in to access your account.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700">Email Address</label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input 
                      type="email" 
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      placeholder={''}
                      required
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700">Phone Number</label>
                 <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      placeholder="Enter your phone number"
                      required
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    
                 </div>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        placeholder={''}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button type="button" className="text-xs font-semibold text-primary hover:text-primary-dark">Forgot password?</button>
                 </div>
              </div>
              
              {error && (
                 <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                 </div>
              )}

              <Button type="submit" className="w-full py-3 shadow-lg shadow-primary/25" disabled={loading}>
                 {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
              </Button>
           </form>

           <p className="text-center text-sm text-slate-500">
              Don't have an account? <Link to="/register" className="font-bold text-primary hover:underline">Sign up</Link>
           </p>
        </div>
      </div>
    </div>
  )
}
