import { useState } from 'react'
import Button from './Button.jsx'

export default function NamePromptModal({ title, initialValue = '', confirmLabel = 'Save', onConfirm, onClose }) {
  const [value, setValue] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    setLoading(true)
    await onConfirm(value.trim())
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-xl"
      >
        <h3 className="mb-3 font-display text-base font-semibold text-text-primary">{title}</h3>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" className="w-auto px-4" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="w-auto px-4" disabled={!value.trim()}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </div>
  )
}
