import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HardDrive, AlertCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { quota } from '../services/api.js'
import { useAsync } from '../hooks/useAsync.js'
import { getFileVisual, TYPE_LABELS } from '../utils/fileVisuals.js'
import { formatBytes } from '../utils/format.js'

function StorageRingLarge({ usedPct }) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (usedPct / 100) * circumference

  return (
    <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90 shrink-0">
      <circle cx="90" cy="90" r={radius} fill="none" stroke="#E4E7EC" strokeWidth="16" />
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="none"
        stroke="#4F46E5"
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useAsync(() => quota.get(), [])

  const usedPct = data ? Math.min(100, Math.round((data.usedBytes / data.totalBytes) * 100)) : 0
  const breakdownEntries = data
    ? Object.entries(data.breakdown).sort((a, b) => b[1] - a[1])
    : []

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar onNewFolder={() => {}} />

      <main className="flex-1 overflow-y-auto">
        <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-5 sm:px-8">
          <button
            onClick={() => navigate('/drive')}
            className="rounded-md p-1.5 text-text-secondary hover:bg-bg hover:text-text-primary"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display text-lg font-semibold text-text-primary">Settings</h1>
        </header>

        <div className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-8">
          {/* Account section */}
          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Account
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-semibold text-white">
                {user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-medium text-text-primary">{user?.name}</p>
                <p className="text-sm text-text-secondary">{user?.email}</p>
              </div>
            </div>
          </section>

          {/* Storage section */}
          <section className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Storage
            </h2>

            {loading ? (
              <div className="h-44 animate-pulse rounded-lg bg-border/40" />
            ) : error ? (
              <div className="flex flex-col items-center gap-2 rounded-lg bg-danger/10 p-6 text-center">
                <AlertCircle size={22} className="text-danger" />
                <p className="text-sm text-danger">Couldn't load storage usage.</p>
                <button onClick={reload} className="text-sm font-medium text-accent hover:text-accent-hover">
                  Try again
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left sm:gap-8">
                  <StorageRingLarge usedPct={usedPct} />
                  <div>
                    <p className="font-display text-3xl font-bold text-text-primary">{usedPct}%</p>
                    <p className="mt-1 font-mono text-sm text-text-secondary">
                      {formatBytes(data.usedBytes)} of {formatBytes(data.totalBytes)} used
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">{data.fileCount} files</p>
                  </div>
                </div>

                {breakdownEntries.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                      Breakdown by type
                    </p>
                    {breakdownEntries.map(([type, bytes]) => {
                      const { icon: Icon, color } = getFileVisual(type)
                      const pct = Math.round((bytes / data.usedBytes) * 100)
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <Icon size={16} style={{ color }} className="shrink-0" strokeWidth={1.5} />
                          <span className="w-28 shrink-0 text-sm text-text-primary">{TYPE_LABELS[type] || type}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                          <span className="w-16 shrink-0 text-right font-mono text-xs text-text-secondary">
                            {formatBytes(bytes)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </section>

          <section className="flex items-center gap-3 rounded-xl border border-border bg-accent-soft p-4">
            <HardDrive size={18} className="shrink-0 text-accent" />
            <p className="text-sm text-accent">
              Need more space? Storage plans and upgrades arrive once billing is wired up in a later phase.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
