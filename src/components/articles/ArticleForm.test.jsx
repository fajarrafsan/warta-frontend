import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ArticleForm from './ArticleForm.jsx'

function renderForm(onSubmit = vi.fn()) {
  render(
    <MemoryRouter>
      <ArticleForm onSubmit={onSubmit} />
    </MemoryRouter>,
  )

  return onSubmit
}

describe('ArticleForm', () => {
  it('menampilkan validasi field sebelum submit', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(await screen.findByText('Title wajib diisi.')).toBeInTheDocument()
    expect(screen.getByText('Content wajib diisi.')).toBeInTheDocument()
    expect(screen.getByText('Category wajib diisi.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('mengirim payload draft dari controlled form', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm(vi.fn().mockResolvedValue(undefined))
    const content = 'Konten artikel yang menjelaskan proses pengembangan aplikasi secara lengkap, terstruktur, dan mudah dipahami oleh pembaca. '.repeat(2)

    await user.type(screen.getByLabelText(/Title/), 'Panduan Lengkap Mengelola Artikel Digital')
    await user.type(screen.getByLabelText(/Content/), content)
    await user.type(screen.getByLabelText(/Category/), 'Teknologi')
    await user.click(screen.getByRole('button', { name: 'Simpan Draft' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Panduan Lengkap Mengelola Artikel Digital',
        content: content.trim(),
        category: 'Teknologi',
        status: 'draft',
      })
    })
  })
})

