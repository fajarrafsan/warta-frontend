import { useRef, useState } from 'react'
import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react'
import { assetUrl } from '../../api/client.js'
import { uploadImage } from '../../api/articleApi.js'

// CoverField mengunggah gambar sampul lalu menyimpan path-nya sebagai nilai.
export default function CoverField({ value, onChange, error }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragging, setDragging] = useState(false)

  async function upload(file) {
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      onChange(await uploadImage(file))
    } catch (failure) {
      setUploadError(failure.fields?.image || failure.message)
    } finally {
      setUploading(false)
    }
  }

  const message = uploadError || error

  return (
    <div>
      <p id="cover-label" className="text-sm font-semibold text-text-primary">Gambar sampul</p>
      {value ? (
        <div className="relative mt-2 overflow-hidden rounded-xl border border-border">
          <img src={assetUrl(value)} alt="Pratinjau gambar sampul" className="aspect-[16/9] w-full object-cover" />
          <div className="absolute right-2 top-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="focus-ring inline-flex min-h-9 cursor-pointer items-center rounded-lg bg-bg-secondary/90 px-3 text-xs font-semibold text-text-primary backdrop-blur"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Hapus gambar sampul"
              className="focus-ring grid size-9 cursor-pointer place-items-center rounded-lg bg-bg-secondary/90 text-danger backdrop-blur"
            >
              <Trash2 aria-hidden="true" size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            upload(event.dataTransfer.files?.[0])
          }}
          disabled={uploading}
          aria-describedby="cover-help"
          className={`focus-ring mt-2 flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm transition-colors ${
            dragging ? 'border-accent bg-accent/5 text-text-primary' : 'border-border bg-bg-primary text-text-secondary hover:border-text-tertiary'
          }`}
        >
          {uploading
            ? <LoaderCircle aria-hidden="true" size={22} className="animate-spin" />
            : <ImagePlus aria-hidden="true" size={22} />}
          <span className="font-semibold">{uploading ? 'Mengunggah...' : 'Unggah atau seret gambar'}</span>
        </button>
      )}
      <p id="cover-help" className="mt-2 text-xs text-text-tertiary">JPEG, PNG, WebP, atau GIF, paling besar 2 MB. Rasio 16:9 terlihat paling baik.</p>
      {message && <p className="mt-2 text-sm font-medium text-danger" role="alert">{message}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        aria-labelledby="cover-label"
        onChange={(event) => {
          upload(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </div>
  )
}
