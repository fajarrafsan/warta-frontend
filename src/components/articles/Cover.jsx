import { assetUrl } from '../../api/client.js'

// Cover menampilkan gambar sampul, atau bidang bermotif dengan inisial kategori
// bila artikel tidak punya sampul, supaya kartu tetap seimbang.
export default function Cover({ article, className = '', eager = false }) {
  if (article.cover_image) {
    return (
      <img
        src={assetUrl(article.cover_image)}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  return (
    <div aria-hidden="true" className={`relative h-full w-full overflow-hidden bg-bg-soft editorial-grid ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,color-mix(in_srgb,var(--accent-color)_26%,transparent),transparent_48%)]" />
      <span className="absolute bottom-[-0.2em] left-4 select-none font-display text-[7rem] font-semibold leading-none text-text-primary/10">
        {article.category.name.charAt(0)}
      </span>
    </div>
  )
}
