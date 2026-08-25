import { MoreVertical } from 'lucide-react'
import { getFileVisual } from '../utils/fileVisuals.js'
import { formatBytes, formatDate } from '../utils/format.js'

export default function FileListRow({ item, onOpen, onMenu, selected, onSelect }) {
  const { icon: Icon, color } = getFileVisual(item.type)

  return (
    <div
      onClick={() => onSelect(item.id)}
      onDoubleClick={() => item.type === 'folder' && onOpen(item.id)}
      className={`group grid cursor-pointer grid-cols-[1fr_40px] items-center gap-4 rounded-lg px-3 py-2.5 transition sm:grid-cols-[1fr_120px_140px_40px] ${
        selected ? 'bg-accent-soft' : 'hover:bg-bg'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Icon size={18} style={{ color }} strokeWidth={1.5} className="shrink-0" />
        <span className="truncate text-sm font-medium text-text-primary">{item.name}</span>
      </div>
      <span className="hidden font-mono text-xs text-text-secondary sm:block">
        {item.type === 'folder' ? '—' : formatBytes(item.size)}
      </span>
      <span className="hidden font-mono text-xs text-text-secondary sm:block">{formatDate(item.modifiedAt)}</span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onMenu(item, e)
        }}
        className="justify-self-end rounded-md p-1 text-text-secondary opacity-0 transition hover:bg-surface group-hover:opacity-100"
      >
        <MoreVertical size={16} />
      </button>
    </div>
  )
}
