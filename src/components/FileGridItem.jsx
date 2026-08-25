import { MoreVertical } from 'lucide-react'
import { getFileVisual } from '../utils/fileVisuals.js'
import { formatBytes } from '../utils/format.js'

export default function FileGridItem({ item, onOpen, onMenu, selected, onSelect }) {
  const { icon: Icon, color } = getFileVisual(item.type)

  return (
    <div
      onClick={() => onSelect(item.id)}
      onDoubleClick={() => item.type === 'folder' && onOpen(item.id)}
      className={`group relative flex cursor-pointer flex-col rounded-xl border p-4 transition ${
        selected ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:border-accent/40'
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onMenu(item, e)
        }}
        className="absolute right-2 top-2 rounded-md p-1 text-text-secondary opacity-0 transition hover:bg-bg group-hover:opacity-100"
      >
        <MoreVertical size={16} />
      </button>

      <div className="mb-3 flex h-16 items-center justify-center">
        <Icon size={40} style={{ color }} strokeWidth={1.5} />
      </div>

      <p className="truncate text-sm font-medium text-text-primary" title={item.name}>
        {item.name}
      </p>
      <p className="mt-0.5 font-mono text-xs text-text-secondary">
        {item.type === 'folder' ? 'Folder' : formatBytes(item.size)}
      </p>
    </div>
  )
}
