export default function FormField({ label, error, ...inputProps }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-text-primary">{label}</span>
      <input
        {...inputProps}
        className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-text-primary
          placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-accent/30
          ${error ? 'border-danger focus:ring-danger/20' : 'border-border focus:border-accent'}`}
      />
      {error && <span className="mt-1.5 block text-xs text-danger">{error}</span>}
    </label>
  )
}
