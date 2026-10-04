// searchTerms memecah kata kunci seperti backend: huruf kecil, hanya huruf
// dan angka, tanpa duplikat, paling banyak delapan kata.
export function searchTerms(query) {
  const terms = []
  for (const term of String(query || '').toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
    if (term && !terms.includes(term)) terms.push(term)
    if (terms.length === 8) break
  }
  return terms
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// splitHighlight memecah teks menjadi bagian yang cocok dan tidak cocok
// dengan salah satu kata. Backend mencocokkan awalan kata ("golan" menemukan
// "golang"), jadi yang disorot adalah bagian yang diketik pengguna.
export function splitHighlight(text, terms) {
  const value = String(text || '')
  const usable = terms.filter(Boolean).sort((a, b) => b.length - a.length)
  if (usable.length === 0 || !value) return [{ text: value, match: false }]

  const pattern = new RegExp(`(${usable.map(escapeRegExp).join('|')})`, 'giu')
  return value
    .split(pattern)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, match: usable.includes(part.toLowerCase()) }))
}
