import { HardDrive, LayoutGrid, Users, Clock, Trash2, LogOut, Plus, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { quota } from '../services/api.js'
import { formatBytes } from '../utils/format.js'

const navItems = [
  { to: '/drive', icon: LayoutGrid, label: 'My Drive' },
  { to: '/drive/shared', icon: Users, label: 'Shared with me' },
  { to: '/drive/recent', icon: Clock, label: 'Recent' },
  { to: '/drive/trash', icon: Trash2, label: 'Trash' },
]

function StorageRingMini({ usedPct = 62 }) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (usedPct / 100) * circumference
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90 shrink-0">
      <circle cx="26" cy="26" r={radius} fill="none" stroke="#E4E7EC" strokeWidth="5" />
      <circle
        cx="26"
        cy="26"
        r={radius}
        fill="none"
        stroke="#4F46E5"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  )
}

export default function Sidebar({ onNewFolder, open = false, onClose = () => {} }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    quota.get().then(setUsage)
  }, [])

  const usedPct = usage ? Math.min(100, Math.round((usage.usedBytes / usage.totalBytes) * 100)) : 0

  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface
          transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <HardDrive className="text-accent" size={22} />
            <span className="font-display text-lg font-semibold text-text-primary">Vaultly</span>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary lg:hidden">
            <X size={20} />
          </button>
        </div>

      <div className="px-4">
        <button
          onClick={onNewFolder}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          <Plus size={16} /> New folder
        </button>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/drive'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-accent-soft text-accent' : 'text-text-secondary hover:bg-bg hover:text-text-primary'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <button
          onClick={() => navigate('/drive/settings')}
          className="mb-3 flex w-full items-center gap-3 rounded-lg bg-bg p-3 text-left transition hover:bg-accent-soft"
        >
          <StorageRingMini usedPct={usedPct} />
          <div className="min-w-0">
            <p className="font-mono text-xs text-text-secondary">
              {usage ? `${formatBytes(usage.usedBytes)} of ${formatBytes(usage.totalBytes)}` : '—'}
            </p>
            <p className="text-xs text-text-secondary">used</p>
          </div>
        </button>

        <div className="flex items-center gap-3 px-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">{user?.name}</p>
            <p className="truncate text-xs text-text-secondary">{user?.email}</p>
          </div>
          <button onClick={logout} title="Log out" className="text-text-secondary hover:text-danger">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
    </>
  )
}
