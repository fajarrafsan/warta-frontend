import { fromLocalInput, toLocalInput } from './articleUtils.js'

describe('input jadwal', () => {
  it('bolak-balik antara ISO dan datetime-local', () => {
    const local = '2026-10-05T09:30'
    const iso = fromLocalInput(local)
    expect(new Date(iso).getHours()).toBe(9)
    expect(toLocalInput(iso)).toBe(local)
  })

  it('nilai kosong atau salah', () => {
    expect(fromLocalInput('')).toBeNull()
    expect(fromLocalInput('bukan tanggal')).toBeNull()
    expect(toLocalInput(null)).toBe('')
  })
})
