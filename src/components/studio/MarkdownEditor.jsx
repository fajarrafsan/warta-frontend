import { useRef, useState } from 'react'
import { ImagePlus, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { uploadImage } from '../../api/articleApi.js'
import Markdown from '../articles/Markdown.jsx'
import { ACTIONS, applyAction } from './markdownActions.js'

export default function MarkdownEditor({ id, name, value, onChange, onBlur, invalid, describedBy }) {
  const textareaRef = useRef(null)
  const imageInputRef = useRef(null)
  const [tab, setTab] = useState('write')
  const [uploading, setUploading] = useState(false)

  function update(next, selStart, selEnd) {
    onChange({ target: { name, value: next } })
    requestAnimationFrame(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      textarea.focus()
      textarea.setSelectionRange(selStart, selEnd)
    })
  }

  function run(action) {
    const textarea = textareaRef.current
    const { next, selStart, selEnd } = applyAction(value, textarea.selectionStart, textarea.selectionEnd, action)
    update(next, selStart, selEnd)
  }

  function handleKeyDown(event) {
    if (!(event.ctrlKey || event.metaKey)) return
    const key = event.key.toLowerCase()
    const action = ACTIONS.find((item) => (key === 'b' && item.key === 'bold') || (key === 'i' && item.key === 'italic'))
    if (action) {
      event.preventDefault()
      run(action)
    }
  }

  async function insertImage(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadImage(file)
      const textarea = textareaRef.current
      const at = textarea ? textarea.selectionEnd : value.length
      const snippet = `\n![${file.name.replace(/\.[^.]+$/, '')}](${url})\n`
      update(value.slice(0, at) + snippet + value.slice(at), at + snippet.length, at + snippet.length)
      toast.success('Gambar disisipkan.')
    } catch (error) {
      toast.error(error.fields?.image || error.message)
    } finally {
      setUploading(false)
    }
  }

  const tabClass = (active) => `focus-ring min-h-9 cursor-pointer rounded-lg px-3 text-sm font-semibold transition-colors ${
    active ? 'bg-bg-secondary text-text-primary shadow-soft' : 'text-text-secondary hover:text-text-primary'
  }`

  return (
    <div className={`mt-2 overflow-hidden rounded-xl border bg-bg-primary ${invalid ? 'border-danger' : 'border-border'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-bg-soft/60 px-2 py-1.5">
        <div className="flex rounded-xl bg-bg-soft p-1" role="tablist" aria-label="Mode editor">
          <button type="button" role="tab" aria-selected={tab === 'write'} className={tabClass(tab === 'write')} onClick={() => setTab('write')}>Tulis</button>
          <button type="button" role="tab" aria-selected={tab === 'preview'} className={tabClass(tab === 'preview')} onClick={() => setTab('preview')}>Pratinjau</button>
        </div>
        {tab === 'write' && (
          <div className="flex flex-wrap items-center gap-0.5" role="toolbar" aria-label="Format teks">
            {ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => run(action)}
                  aria-label={action.label}
                  title={action.label}
                  className="focus-ring grid size-9 cursor-pointer place-items-center rounded-lg text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                >
                  <Icon aria-hidden="true" size={17} />
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
              aria-label="Sisipkan gambar"
              title="Sisipkan gambar"
              className="focus-ring grid size-9 cursor-pointer place-items-center rounded-lg text-text-secondary hover:bg-bg-hover hover:text-text-primary disabled:opacity-50"
            >
              {uploading ? <LoaderCircle aria-hidden="true" size={17} className="animate-spin" /> : <ImagePlus aria-hidden="true" size={17} />}
            </button>
            <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={insertImage} />
          </div>
        )}
      </div>

      {tab === 'write' ? (
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          className="focus-ring block min-h-96 w-full resize-y bg-bg-primary px-4 py-3 font-mono text-[15px] leading-7 text-text-primary placeholder:text-text-tertiary"
          placeholder={'Tulis isi artikel di sini. Markdown didukung, misalnya:\n\n## Subjudul\n**tebal**, _miring_, [tautan](https://...), - daftar'}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />
      ) : (
        <div className="min-h-96 px-5 py-4">
          {value.trim()
            ? <Markdown>{value}</Markdown>
            : <p className="text-sm text-text-tertiary">Belum ada isi untuk dipratinjau.</p>}
        </div>
      )}
    </div>
  )
}
