import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { HeartPulse, Mail, Lock, User, AlertCircle, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'

const ROLES = [
  { value: 'patient', label: 'Patient' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'reception', label: 'Reception' },
]

const FEATURES = [
  'Instant appointment booking',
  'Real-time queue tracking',
  'Secure patient records',
]

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('patient')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      await register({ name, identifier, password, role })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err?.message ?? 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-neutral-dark placeholder:text-neutral-dark/30 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10'

  return (
    <div className="flex min-h-screen bg-background">
      {/* ─── Left branding panel ─── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-primary p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-wide">PulseCare</span>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              Join PulseCare today.
            </h2>
            <p className="mt-4 text-white/60 text-base leading-relaxed">
              Create your account and start managing your healthcare journey with ease.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-white/80 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">© 2026 PulseCare. All rights reserved.</p>
      </div>

      {/* ─── Right form panel ─── */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 overflow-y-auto">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-neutral-dark">PulseCare</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-dark">Create an account</h1>
            <p className="mt-1 text-sm text-neutral-dark/50">Fill in the details below to get started</p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-green-100 bg-green-50 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Account created!</p>
                <p className="mt-1 text-sm text-green-600">Redirecting you to sign in…</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-dark/60">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-dark/30" />
                  <input
                    className={inputClass}
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-dark/60">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-dark/30" />
                  <input
                    className={inputClass}
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Role selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-dark/60">
                  I am a…
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={`rounded-xl border py-3 text-xs font-semibold transition ${
                        role === value
                          ? 'border-primary bg-primary text-white shadow-sm shadow-primary/20'
                          : 'border-slate-200 bg-white text-neutral-dark/60 hover:border-primary/30 hover:text-primary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-dark/60">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-dark/30" />
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-neutral-dark placeholder:text-neutral-dark/30 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-dark/30 hover:text-neutral-dark/60 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-dark/60">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-dark/30" />
                  <input
                    className={inputClass}
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <Button className="w-full py-3 text-sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-neutral-dark/50">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary transition hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
