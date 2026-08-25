import { AlertTriangle } from 'lucide-react'
import Button from './Button.jsx'

export default function ConfirmModal({
  title,
  description,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-xl"
      >
        <div className="flex items-start gap-3">
          {danger && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/10">
              <AlertTriangle size={18} className="text-danger" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold text-text-primary">{title}</h3>
            {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" className="w-auto px-4" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className={`w-auto px-4 ${danger ? '!bg-danger hover:!bg-red-600' : ''}`}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
