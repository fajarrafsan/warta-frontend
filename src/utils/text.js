// sentence merapikan pesan dari backend (huruf kecil, tanpa titik) menjadi
// kalimat untuk ditampilkan.
export function sentence(text) {
  const trimmed = String(text || '').trim()
  if (!trimmed) return ''
  const capitalized = trimmed[0].toUpperCase() + trimmed.slice(1)
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`
}
