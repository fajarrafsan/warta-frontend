import { sentence } from './text.js'

it('merapikan pesan backend menjadi kalimat', () => {
  expect(sentence('tautan tidak valid')).toBe('Tautan tidak valid.')
  expect(sentence('Sudah rapi.')).toBe('Sudah rapi.')
  expect(sentence('')).toBe('')
})
