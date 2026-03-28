const BUTTON_VARIANTS = {
  primary:
    'bg-primary text-white shadow-soft hover:shadow-card-hover hover:bg-primary-light hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary',
  secondary:
    'bg-white text-secondary border border-secondary-light shadow-sm hover:bg-background hover:border-secondary active:bg-slate-100 active:scale-[0.98] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-secondary',
  ghost:
    'bg-transparent text-secondary hover:bg-surface/50 hover:text-text-primary active:bg-surface/75 outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-lg',
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

