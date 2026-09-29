import { Bold, Code, Heading2, Italic, Link2, List, ListOrdered, Quote } from 'lucide-react'

// Setiap aksi mengubah teks terpilih: membungkusnya (wrap) atau memberi awalan
// di setiap baris (prefix).
export const ACTIONS = [
  { key: 'h2', label: 'Subjudul', icon: Heading2, prefix: '## ' },
  { key: 'bold', label: 'Tebal (Ctrl+B)', icon: Bold, wrap: ['**', '**'], placeholder: 'teks tebal' },
  { key: 'italic', label: 'Miring (Ctrl+I)', icon: Italic, wrap: ['_', '_'], placeholder: 'teks miring' },
  { key: 'link', label: 'Tautan', icon: Link2, wrap: ['[', '](https://)'], placeholder: 'teks tautan' },
  { key: 'quote', label: 'Kutipan', icon: Quote, prefix: '> ' },
  { key: 'list', label: 'Daftar berbutir', icon: List, prefix: '- ' },
  { key: 'ordered', label: 'Daftar bernomor', icon: ListOrdered, prefix: '1. ' },
  { key: 'code', label: 'Kode', icon: Code, wrap: ['`', '`'], placeholder: 'kode' },
]

export function applyAction(value, start, end, action) {
  if (action.wrap) {
    const [before, after] = action.wrap
    const selected = value.slice(start, end) || action.placeholder
    const next = value.slice(0, start) + before + selected + after + value.slice(end)
    return { next, selStart: start + before.length, selEnd: start + before.length + selected.length }
  }

  // Awalan dipasang di setiap baris yang tersentuh seleksi.
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const block = value.slice(lineStart, end)
  const prefixed = block.split('\n').map((line) => action.prefix + line).join('\n')
  const next = value.slice(0, lineStart) + prefixed + value.slice(end)
  return { next, selStart: lineStart, selEnd: lineStart + prefixed.length }
}
