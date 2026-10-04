import { collapseSame, diffLines } from './diff.js'

describe('diffLines', () => {
  it('menemukan baris yang ditambah dan dihapus', () => {
    expect(diffLines('a\nb\nc', 'a\nB\nc\nd')).toEqual([
      { type: 'same', text: 'a' },
      { type: 'del', text: 'b' },
      { type: 'add', text: 'B' },
      { type: 'same', text: 'c' },
      { type: 'add', text: 'd' },
    ])
  })

  it('teks sama tidak punya perubahan', () => {
    expect(diffLines('x\ny', 'x\ny').every((line) => line.type === 'same')).toBe(true)
  })

  it('teks yang terlalu besar tidak dihitung', () => {
    const big = Array.from({ length: 3000 }, (_, i) => `baris ${i}`).join('\n')
    expect(diffLines(big, `${big}\nlagi`)).toBeNull()
  })
})

describe('collapseSame', () => {
  it('meringkas baris sama yang jauh dari perubahan', () => {
    const before = Array.from({ length: 20 }, (_, i) => `baris ${i}`).join('\n')
    const after = before.replace('baris 10', 'baris sepuluh')
    const lines = collapseSame(diffLines(before, after))
    expect(lines.filter((line) => line.type === 'skip').map((line) => line.count)).toEqual([8, 7])
    expect(lines.filter((line) => line.type !== 'skip').map((line) => line.text)).toEqual([
      'baris 8', 'baris 9', 'baris 10', 'baris sepuluh', 'baris 11', 'baris 12',
    ])
  })
})
