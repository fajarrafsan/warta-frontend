import { describe, expect, it } from 'vitest'
import { ACTIONS, applyAction } from './markdownActions.js'

const action = (key) => ACTIONS.find((item) => item.key === key)

describe('applyAction', () => {
  it('membungkus teks terpilih dan memilih ulang isinya', () => {
    const result = applyAction('halo dunia', 5, 10, action('bold'))
    expect(result.next).toBe('halo **dunia**')
    expect(result.next.slice(result.selStart, result.selEnd)).toBe('dunia')
  })

  it('memakai teks contoh bila tidak ada yang dipilih', () => {
    expect(applyAction('', 0, 0, action('link')).next).toBe('[teks tautan](https://)')
  })

  it('memberi awalan di setiap baris yang terpilih', () => {
    const value = 'judul\nsatu\ndua'
    expect(applyAction(value, 7, value.length, action('list')).next).toBe('judul\n- satu\n- dua')
  })
})
