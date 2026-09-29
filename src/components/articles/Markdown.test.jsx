import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Markdown from './Markdown.jsx'

describe('Markdown', () => {
  it('merender format umum dan tabel GFM', () => {
    render(<Markdown>{'## Subjudul\n\n**tebal** dan [tautan](https://warta.id)\n\n| a | b |\n|---|---|\n| 1 | 2 |'}</Markdown>)

    expect(screen.getByRole('heading', { level: 2, name: 'Subjudul' })).toBeInTheDocument()
    expect(screen.getByText('tebal').tagName).toBe('STRONG')
    expect(screen.getByRole('link', { name: 'tautan' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('tidak merender HTML mentah maupun tautan javascript:', () => {
    const { container } = render(<Markdown>{'<img src=x onerror="alert(1)">\n\n[klik](javascript:alert(1))'}</Markdown>)

    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('klik').getAttribute('href') || '').not.toContain('javascript')
  })
})
