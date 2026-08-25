import { Loader2 } from 'lucide-react'

export default function Button({ loading, children, variant = 'primary', className = '', ...props }) {
  const base =
    'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60'
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    ghost: 'border border-border bg-surface text-text-primary hover:bg-accent-soft',
  }

  return (
    <button {...props} disabled={loading || props.disabled} className={`${base} ${variants[variant]} ${className}`}>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}
