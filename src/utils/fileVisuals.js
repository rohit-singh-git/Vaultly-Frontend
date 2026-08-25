import { Folder, FileText, Image, Sheet, FileVideo, File as FileIcon } from 'lucide-react'

const typeMap = {
  folder: { icon: Folder, color: '#4F46E5' },
  pdf: { icon: FileText, color: '#F04438' },
  doc: { icon: FileText, color: '#2563EB' },
  sheet: { icon: Sheet, color: '#12B76A' },
  image: { icon: Image, color: '#F59E0B' },
  video: { icon: FileVideo, color: '#7C3AED' },
  default: { icon: FileIcon, color: '#667085' },
}

export function getFileVisual(type) {
  return typeMap[type] || typeMap.default
}

export const TYPE_LABELS = {
  pdf: 'PDFs',
  doc: 'Documents',
  sheet: 'Spreadsheets',
  image: 'Images',
  video: 'Videos',
  default: 'Other',
}
