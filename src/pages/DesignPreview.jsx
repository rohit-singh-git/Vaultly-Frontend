import { HardDrive, Upload, FolderOpen, FileText } from 'lucide-react'

const swatches = [
  { name: 'bg', hex: '#F7F8FA', className: 'bg-bg border border-border' },
  { name: 'surface', hex: '#FFFFFF', className: 'bg-surface border border-border' },
  { name: 'accent', hex: '#4F46E5', className: 'bg-accent' },
  { name: 'accent-soft', hex: '#EEF2FF', className: 'bg-accent-soft border border-border' },
  { name: 'warn', hex: '#F59E0B', className: 'bg-warn' },
  { name: 'success', hex: '#12B76A', className: 'bg-success' },
  { name: 'danger', hex: '#F04438', className: 'bg-danger' },
]

// Signature element: circular storage-quota ring instead of a generic bar.
function StorageRing({ usedPct = 62 }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (usedPct / 100) * circumference

  return (
    <div className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#E4E7EC" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#4F46E5"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div>
        <p className="font-display text-3xl font-semibold text-text-primary">{usedPct}%</p>
        <p className="font-mono text-sm text-text-secondary">12.4 GB of 20 GB used</p>
      </div>
    </div>
  )
}

export default function DesignPreview() {
  return (
    <div className="min-h-screen bg-bg px-8 py-12 md:px-16">
      <header className="mb-12 flex items-center gap-3">
        <HardDrive className="text-accent" size={28} />
        <h1 className="font-display text-2xl font-bold tracking-tight">Vaultly — Design System</h1>
      </header>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Color tokens
        </h2>
        <div className="flex flex-wrap gap-4">
          {swatches.map((s) => (
            <div key={s.name} className="w-28">
              <div className={`h-16 w-full rounded-lg ${s.className}`} />
              <p className="mt-2 font-mono text-xs text-text-primary">{s.name}</p>
              <p className="font-mono text-xs text-text-secondary">{s.hex}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Typography
        </h2>
        <div className="space-y-3 rounded-xl border border-border bg-surface p-6">
          <p className="font-display text-4xl font-bold">Space Grotesk — Display</p>
          <p className="font-body text-lg">Inter — Body text for everyday reading and UI labels.</p>
          <p className="font-mono text-sm text-text-secondary">IBM Plex Mono — file sizes, dates, metadata</p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Signature element — storage ring
        </h2>
        <div className="rounded-xl border border-border bg-surface p-6">
          <StorageRing usedPct={62} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Core components preview
        </h2>
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface p-6">
          <button className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-body text-sm font-medium text-white transition hover:bg-accent-hover">
            <Upload size={16} /> Upload
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 font-body text-sm font-medium text-text-primary transition hover:bg-accent-soft">
            <FolderOpen size={16} /> New folder
          </button>
          <div className="flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-accent">
            <FileText size={16} />
            <span className="font-mono text-xs">report.pdf · 2.1 MB</span>
          </div>
        </div>
      </section>
    </div>
  )
}
