const BUTTON_VARIANTS = {
  primary:
    'bg-primary-600 text-white shadow-card hover:bg-primary-700 hover:shadow-card-hover active:scale-[0.98] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary-500',
  secondary:
    'bg-surface text-secondary-700 border border-secondary-200 shadow-card hover:bg-secondary-50 hover:border-secondary-300 active:bg-secondary-100 active:scale-[0.98] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-secondary-400',
  accent:
    'bg-accent-500 text-white shadow-card hover:bg-accent-600 hover:shadow-card-hover active:scale-[0.98] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-accent-400',
  ghost:
    'bg-transparent text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 active:bg-secondary-200 outline-none focus-visible:ring-2 focus-visible:ring-secondary-400',
  danger:
    'bg-red-500 text-white shadow-card hover:bg-red-600 hover:shadow-card-hover active:scale-[0.98] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-red-500',
  link:
    'bg-transparent text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline p-0 h-auto shadow-none',
}

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  const variantClasses = BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary

  return (
    <button
      type={props.type ?? 'button'}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

