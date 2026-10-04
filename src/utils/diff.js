// Batas ukuran tabel LCS. Di atas ini diff dianggap terlalu besar untuk
// dihitung di browser dan pemanggil menampilkan isi lengkap saja.
const MAX_CELLS = 4_000_000

// diffLines membandingkan dua teks per baris (LCS). Hasilnya daftar
// { type: 'same' | 'add' | 'del', text } dari before ke after, atau null bila
// teksnya terlalu besar.
export function diffLines(before, after) {
  const a = String(before ?? '').split('\n')
  const b = String(after ?? '').split('\n')
  const n = a.length
  const m = b.length
  if ((n + 1) * (m + 1) > MAX_CELLS) return null

  // lcs[i][j] = panjang LCS a[i:] dan b[j:], disimpan rata dalam satu array.
  const width = m + 1
  const lcs = new Int32Array((n + 1) * width)
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i * width + j] = a[i] === b[j]
        ? lcs[(i + 1) * width + j + 1] + 1
        : Math.max(lcs[(i + 1) * width + j], lcs[i * width + j + 1])
    }
  }

  const out = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: 'same', text: a[i] })
      i++
      j++
    } else if (lcs[(i + 1) * width + j] >= lcs[i * width + j + 1]) {
      out.push({ type: 'del', text: a[i++] })
    } else {
      out.push({ type: 'add', text: b[j++] })
    }
  }
  while (i < n) out.push({ type: 'del', text: a[i++] })
  while (j < m) out.push({ type: 'add', text: b[j++] })
  return out
}

// collapseSame meringkas baris sama yang panjang menjadi satu penanda
// { type: 'skip', count }, menyisakan context baris di sekitar perubahan.
export function collapseSame(lines, context = 2) {
  const out = []
  let run = []

  function flush(atEnd) {
    const keepStart = out.length === 0 ? 0 : context
    const keepEnd = atEnd ? 0 : context
    if (run.length > keepStart + keepEnd + 1) {
      out.push(...run.slice(0, keepStart))
      out.push({ type: 'skip', count: run.length - keepStart - keepEnd })
      out.push(...run.slice(run.length - keepEnd))
    } else {
      out.push(...run)
    }
    run = []
  }

  for (const line of lines) {
    if (line.type === 'same') {
      run.push(line)
    } else {
      flush(false)
      out.push(line)
    }
  }
  flush(true)
  return out
}
