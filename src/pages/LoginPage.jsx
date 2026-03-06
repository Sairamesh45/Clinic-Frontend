import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Activity, Mail, Lock, Phone, AlertCircle, Loader2, Eye, EyeOff,
  ArrowRight, Heart, Users, Calendar, Shield, CheckCircle, Stethoscope,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { APP_NAME, COPYRIGHT_YEAR, COPYRIGHT_OWNER, DEMO_ACCOUNTS } from '../config/appConfig'

const ROLE_REDIRECTS = {
  patient: '/dashboard',
  doctor: '/doctor',
  reception: '/queue',
}

const FEATURES = [
  'Book appointments in seconds',
  'Real-time queue tracking',
  'Access your health records anytime',
]

const STATS = [
  { icon: Users, value: '12,000+', label: 'Patients' },
  { icon: Calendar, value: '4,500+', label: 'Monthly Visits' },
  { icon: Stethoscope, value: '50+', label: 'Clinics' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const [loginMethod, setLoginMethod] = useState('email')
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
    <div className="flex min-h-screen font-sans">

      {/* ── Left Branding Panel ─────────────────────────────────── */}
      <div
        className="relative hidden w-[46%] flex-col overflow-hidden lg:flex"
        style={{ background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 45%, #d1fae5 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-28 -right-28 h-96 w-96 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="absolute top-1/3 -left-20 h-72 w-72 rounded-full bg-teal-200/50 blur-3xl" />
          <div className="absolute -bottom-20 right-1/3 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />
          {/* Subtle dot grid */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#0284c7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-14">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800">{APP_NAME}</span>
          </div>

          {/* Central illustration */}
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute -inset-4 rounded-full bg-primary/5" />
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-2xl shadow-sky-200/60">
                <Heart className="h-16 w-16 text-primary" strokeWidth={1.5} />
              </div>
              {/* Floating card – appointment */}
              <div className="absolute -top-6 -left-20 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">Next Appointment</p>
                  <p className="text-xs font-bold text-slate-700">Today, 3:30 PM</p>
                </div>
              </div>
              {/* Floating card – queue */}
              <div className="absolute -bottom-6 -right-20 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">Queue Status</p>
                  <p className="text-xs font-bold text-slate-700">3 ahead of you</p>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div className="text-center space-y-3">
              <h1 className="font-heading text-3xl font-bold leading-snug text-slate-800">
                Your Health,{' '}
                <span className="text-primary">Our Priority</span>
              </h1>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-500">
                Connecting patients with trusted healthcare professionals for seamless, modern medical care.
              </p>
            </div>

            {/* Feature list */}
            <div className="w-full space-y-2.5">
              {FEATURES.map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm text-slate-600">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats + copyright */}
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/80 bg-white/70 p-4 text-center shadow-sm backdrop-blur-sm"
                >
                  <Icon className="mx-auto mb-1.5 h-5 w-5 text-primary" />
                  <p className="text-sm font-bold text-slate-800">{value}</p>
                  <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400">
              © {COPYRIGHT_YEAR} {COPYRIGHT_OWNER}. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ────────────────────────────────────── */}
      <div className="flex flex-1 flex-col bg-white">

        {/* Mobile top bar */}
        <div className="flex items-center gap-2.5 p-6 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-800">{APP_NAME}</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-8 py-12 lg:px-16">
          <div className="w-full max-w-md space-y-7">

            {/* Header */}
            <div className="space-y-1">
              <h2 className="font-heading text-3xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500">Sign in to your account to continue.</p>
            </div>

            {/* Demo accounts */}
            {DEMO_ACCOUNTS && DEMO_ACCOUNTS.length > 0 && (
              <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-sky-500">
                  Quick Demo Access
                </p>
                <div className="flex flex-wrap gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.role}
                      onClick={() => {
                        setLoginMethod('email')
                        setIdentifier(acc.email)
                        if (acc.password) setPassword(acc.password)
                      }}
                      className="group flex items-center gap-2.5 rounded-xl border border-sky-200 bg-white px-3.5 py-2 text-left shadow-sm transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold capitalize text-slate-700 group-hover:text-primary transition-colors">
                          {acc.role}
                        </p>
                        <p className="text-[10px] text-slate-400">{acc.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Method toggle */}
              <div className="flex rounded-2xl border border-slate-100 bg-slate-50 p-1">
                {[
                  { id: 'email', label: 'Email', icon: Mail },
                  { id: 'phone', label: 'Phone', icon: Phone },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLoginMethod(id)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
                      loginMethod === id
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Identifier field */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <div className="relative">
                  {loginMethod === 'email'
                    ? <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    : <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  }
                  <input
                    type={loginMethod === 'email' ? 'email' : 'tel'}
                    value={loginMethod === 'email' ? identifier : phoneNumber}
                    onChange={(e) =>
                      loginMethod === 'email'
                        ? setIdentifier(e.target.value)
                        : setPhoneNumber(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                    placeholder={loginMethod === 'email' ? 'you@example.com' : '+1 (555) 000-0000'}
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Sign-up */}
            <p className="text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-primary transition-colors hover:text-primary-dark"
              >
                Create an account
              </Link>
            </p>

            {/* Trust strip */}
            <div className="flex items-center justify-center gap-6 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Shield className="h-3.5 w-3.5 text-slate-300" />
                HIPAA Compliant
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Lock className="h-3.5 w-3.5 text-slate-300" />
                256-bit Encrypted
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle className="h-3.5 w-3.5 text-slate-300" />
                Secure Login
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
