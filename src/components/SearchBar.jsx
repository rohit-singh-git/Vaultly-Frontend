import { useEffect, useRef, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'folder', label: 'Folders' },
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: 'Documents' },
  { value: 'sheet', label: 'Spreadsheets' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
]

const MODIFIED_OPTIONS = [
  { value: 'any', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
]

export default function SearchBar({ value, onChange, filters, onFiltersChange }) {
  const [draft, setDraft] = useState(value)
  const [showFilters, setShowFilters] = useState(false)
  const popoverRef = useRef(null)

  // Debounce the text query so we don't re-search on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => onChange(draft), 250)
    return () => clearTimeout(handle)
  }, [draft, onChange])

  useEffect(() => {
    function handleClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setShowFilters(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const activeFilterCount = (filters.type !== 'all' ? 1 : 0) + (filters.modified !== 'any' ? 1 : 0)

  return (
    <div className="relative flex-1 max-w-md">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2">
        <Search size={16} className="shrink-0 text-text-secondary" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Search files and folders"
          className="min-w-0 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none"
        />
        {draft && (
          <button onClick={() => setDraft('')} className="text-text-secondary hover:text-text-primary">
            <X size={14} />
          </button>
        )}
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`relative shrink-0 rounded-md p-1 transition ${
            activeFilterCount > 0 ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <SlidersHorizontal size={16} />
          {activeFilterCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-30 mt-2 w-64 rounded-lg border border-border bg-surface p-4 shadow-lg"
        >
          <div className="mb-3">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-secondary">Type</p>
            <select
              value={filters.type}
              onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
              className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-secondary">Modified</p>
            <select
              value={filters.modified}
              onChange={(e) => onFiltersChange({ ...filters, modified: e.target.value })}
              className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {MODIFIED_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={() => onFiltersChange({ type: 'all', modified: 'any', owner: 'all' })}
              className="mt-3 text-xs font-medium text-accent hover:text-accent-hover"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
