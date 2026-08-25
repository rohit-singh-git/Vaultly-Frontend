import { HardDrive } from 'lucide-react'

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      {/* Branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-accent p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <HardDrive size={24} />
          <span className="font-display text-lg font-semibold">Vaultly</span>
        </div>

        <div className="max-w-md">
          <p className="font-display text-3xl font-semibold leading-tight">
            Your files, everywhere you go.
          </p>
          <p className="mt-4 text-accent-soft/90 font-body text-base leading-relaxed">
            Upload, organize, and share from any device. Every account is fully isolated —
            what's yours stays yours.
          </p>
        </div>

        <p className="font-mono text-xs text-white/60">© {new Date().getFullYear()} Vaultly</p>

        {/* signature ambient ring, echoes the storage-quota ring on the dashboard */}
        <svg
          className="pointer-events-none absolute -bottom-24 -right-24 opacity-20"
          width="360"
          height="360"
          viewBox="0 0 360 360"
        >
          <circle cx="180" cy="180" r="170" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="180" cy="180" r="130" fill="none" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-bg px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <HardDrive className="text-accent" size={22} />
            <span className="font-display text-lg font-semibold">Vaultly</span>
          </div>

          {eyebrow && (
            <p className="mb-2 font-mono text-xs uppercase tracking-wider text-accent">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-2xl font-bold text-text-primary">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>}

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
