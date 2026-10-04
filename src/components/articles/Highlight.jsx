import { splitHighlight } from '../../utils/search.js'

// Highlight menyorot kata yang dicari dengan <mark>. Teks tetap dirender
// sebagai teks biasa, bukan HTML.
export default function Highlight({ text, terms }) {
  if (!terms?.length) return text
  return splitHighlight(text, terms).map((part, index) => (
    part.match
      ? <mark key={index} className="rounded-sm bg-accent/20 text-inherit">{part.text}</mark>
      : <span key={index}>{part.text}</span>
  ))
}
