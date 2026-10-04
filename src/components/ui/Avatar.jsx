import { assetUrl } from '../../api/client.js'

const sizes = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
  xl: 'size-24 text-3xl sm:size-28',
}

// Avatar menampilkan foto profil, atau huruf pertama nama bila belum ada foto.
export default function Avatar({ name = '', src, size = 'md', className = '' }) {
  const base = `inline-grid shrink-0 place-items-center overflow-hidden rounded-full ${sizes[size]} ${className}`
  if (src) {
    return <img src={assetUrl(src)} alt="" loading="lazy" decoding="async" className={`${base} object-cover`} />
  }
  return (
    <span aria-hidden="true" className={`${base} bg-brand font-bold uppercase text-brand-contrast`}>
      {name.trim().charAt(0) || '?'}
    </span>
  )
}
