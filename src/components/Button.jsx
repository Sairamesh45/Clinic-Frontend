const BUTTON_VARIANTS = {
  primary:
    'bg-primary text-white shadow-soft hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary',
  secondary:
    'bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 active:scale-[0.98] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-slate-400',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-lg',
  link:
    'bg-transparent text-primary hover:text-primary-dark underline-offset-4 hover:underline padding-0 h-auto shadow-none',
  danger:
    'bg-red-500 text-white shadow-soft hover:bg-red-600 hover:shadow-red-500/30 active:scale-[0.98] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-red-500',
}

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  const variantClasses = BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary

  return (
    <button
      type={props.type ?? 'button'}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:transform-none ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

