import { searchTerms, splitHighlight } from './search.js'

describe('searchTerms', () => {
  it('sama dengan aturan backend', () => {
    expect(searchTerms('  REST-API "golang" +go -drop* (mysql) mysql ')).toEqual(['rest', 'api', 'golang', 'go', 'drop', 'mysql'])
    expect(searchTerms('Kopi Ñandú')).toEqual(['kopi', 'ñandú'])
    expect(searchTerms('+++')).toEqual([])
  })
})

describe('splitHighlight', () => {
  it('menandai kata yang cocok tanpa membedakan huruf besar', () => {
    expect(splitHighlight('Belajar Golang dan golang lagi', ['golang'])).toEqual([
      { text: 'Belajar ', match: false },
      { text: 'Golang', match: true },
      { text: ' dan ', match: false },
      { text: 'golang', match: true },
      { text: ' lagi', match: false },
    ])
  })

  it('awalan kata dan karakter khusus aman', () => {
    expect(splitHighlight('Golang (Go)', ['golan', 'go'])).toEqual([
      { text: 'Golan', match: true },
      { text: 'g (', match: false },
      { text: 'Go', match: true },
      { text: ')', match: false },
    ])
    expect(splitHighlight('a+b', ['+'])).toEqual([{ text: 'a', match: false }, { text: '+', match: true }, { text: 'b', match: false }])
    expect(splitHighlight('teks', [])).toEqual([{ text: 'teks', match: false }])
  })
})
