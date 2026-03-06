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
  const [loginMethod, setLoginMethod] = useState('email') // 'email' or 'phone'
  const [identifier, setIdentifier] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload = loginMethod === 'email'
        ? { identifier, password }
        : { phoneNumber, password }
      const role = await login(payload)
      navigate(ROLE_REDIRECTS[role] || '/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-secondary-50 font-sans text-secondary-900">
      {/* Left Panel - Branding */}
      <div className="relative hidden w-[45%] flex-col overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white lg:flex">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 left-20 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 lg:p-16">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur-md text-white">
                <Activity className="h-5 w-5" />
             </div>
             <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
          </div>

          <div className="space-y-8">
            <h1 className="font-heading text-5xl font-bold leading-tight">
              Modern healthcare <br />
              <span className="text-primary-100">management simplified.</span>
            </h1>
            <p className="max-w-md text-lg text-primary-100/80">
              Streamline your clinic operations, manage appointments, and provide better care for your patients.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl bg-white/10 backdrop-blur-md p-6 border border-white/10">
               {DEMO_ACCOUNTS && DEMO_ACCOUNTS.length > 0 && (
                 <>
                   <p className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">Quick Demo Access</p>
                   <div className="space-y-2">
                     {DEMO_ACCOUNTS.map((acc) => (
                       <button
                         key={acc.role}
                         onClick={() => {
                           setIdentifier(acc.email)
                           if (acc.password) setPassword(acc.password)
                         }}
                         className="group flex w-full items-center justify-between rounded-lg p-3 hover:bg-white/10 text-left transition-colors"
                       >
                         <div>
                           <p className="text-sm font-semibold text-white group-hover:text-primary-100 transition-colors capitalize">{acc.role}</p>
                           <p className="text-xs text-white/60">{acc.email}</p>
                         </div>
                         <ArrowRight className="h-4 w-4 text-white/40 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                       </button>
                     ))}
                   </div>
                 </>
               )}
            </div>
            <p className="text-xs text-white/50">© {COPYRIGHT_YEAR} {COPYRIGHT_OWNER}</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md space-y-8">
           <div className="text-center lg:text-left">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 lg:mx-0 lg:hidden">
                 <Activity className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-secondary-900">Welcome Back</h2>
              <p className="text-secondary-600 mt-2 text-base">Sign in to access your clinic portal</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              {/* Login method toggle */}
              <div className="flex rounded-lg border border-secondary-200 bg-secondary-50 p-1.5 gap-1">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all duration-200 ${
                    loginMethod === 'email'
                      ? 'bg-surface text-primary-600 shadow-card'
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  <Mail className="inline-block h-4 w-4 mr-2 -mt-0.5" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all duration-200 ${
                    loginMethod === 'phone'
                      ? 'bg-surface text-primary-600 shadow-card'
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  <Phone className="inline-block h-4 w-4 mr-2 -mt-0.5" />
                  Phone
                </button>
              </div>

              {/* Email input */}
              {loginMethod === 'email' && (
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-secondary-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-5 w-5 text-secondary-400" />
                    <input 
                      type="email" 
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full rounded-lg border border-secondary-200 bg-secondary-50 py-2.5 pl-11 text-base text-secondary-900 placeholder:text-secondary-500 focus:border-primary-500 focus:bg-surface focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Phone input */}
              {loginMethod === 'phone' && (
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-secondary-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-5 w-5 text-secondary-400" />
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-lg border border-secondary-200 bg-secondary-50 py-2.5 pl-11 text-base text-secondary-900 placeholder:text-secondary-500 focus:border-primary-500 focus:bg-surface focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                 <label className="text-sm font-semibold text-secondary-700">Password</label>
                 <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-5 w-5 text-secondary-400" />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-secondary-200 bg-secondary-50 py-2.5 pl-11 pr-11 text-base text-secondary-900 placeholder:text-secondary-500 focus:border-primary-500 focus:bg-surface focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-secondary-500 hover:text-secondary-700 transition-colors"
                    >
                       {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                 </div>
              </div>
              
              {error && (
                 <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 p-3.5 rounded-lg border border-red-200">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                 </div>
              )}

              <Button type="submit" className="w-full py-3 text-base font-semibold" disabled={loading}>
                 {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
              </Button>
           </form>

           <p className="text-center text-sm text-secondary-600">
              Don't have an account? <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Sign up</Link>
           </p>
        </div>
      </div>
    </div>
  )
}
