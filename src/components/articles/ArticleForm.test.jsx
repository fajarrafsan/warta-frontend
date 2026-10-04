import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/errors.js'
import ArticleForm from './ArticleForm.jsx'

const categories = [
  { id: 1, name: 'Teknologi', slug: 'teknologi' },
  { id: 2, name: 'Bisnis', slug: 'bisnis' },
]

const content = 'Konten artikel yang menjelaskan proses pengembangan aplikasi secara lengkap, terstruktur, dan mudah dipahami oleh pembaca. '.repeat(2)

function renderForm(onSubmit = vi.fn()) {
  render(
    <MemoryRouter>
      <ArticleForm categories={categories} onSubmit={onSubmit} />
    </MemoryRouter>,
  )

  return onSubmit
}

async function fillValidForm(user) {
  await user.type(screen.getByLabelText(/Title/), 'Panduan Lengkap Mengelola Artikel Digital')
  await user.type(screen.getByLabelText(/Content/), content)
  await user.selectOptions(screen.getByLabelText(/Category/), '2')
  await user.type(screen.getByLabelText(/Tags/), 'Golang, backend,  golang')
}

describe('ArticleForm', () => {
  it('menampilkan validasi field sebelum submit', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(await screen.findByText('Title wajib diisi.')).toBeInTheDocument()
    expect(screen.getByText('Content wajib diisi.')).toBeInTheDocument()
    expect(screen.getByText('Pilih category.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('mengirim payload draft dengan category_id dan tag yang dirapikan', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm(vi.fn().mockResolvedValue(undefined))

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Simpan Draft' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Panduan Lengkap Mengelola Artikel Digital',
        content: content.trim(),
        category_id: 2,
        tags: ['golang', 'backend'],
        cover_image: '',
        status: 'draft',
      })
    })
  })

  it('menampilkan error field dari backend', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm(vi.fn().mockRejectedValue(
      new ApiError('validasi gagal', { status: 422, fields: { category_id: 'kategori tidak ditemukan' } }),
    ))

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(await screen.findByText('kategori tidak ditemukan')).toBeInTheDocument()
    expect(onSubmit.mock.calls[0][0].status).toBe('published')
  })

  it('menjadwalkan terbit dengan waktu di masa depan', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm(vi.fn().mockResolvedValue(undefined))

    await fillValidForm(user)
    await user.click(screen.getByLabelText('Jadwalkan terbit'))
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Jadwalkan' }))
    expect(await screen.findByText('Pilih waktu terbit.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    const input = screen.getByLabelText('Waktu terbit')
    await user.type(input, '2020-01-01T08:00')
    await user.click(screen.getByRole('button', { name: 'Jadwalkan' }))
    expect(await screen.findByText('Waktu terbit harus di masa depan.')).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, '2099-06-01T08:30')
    await user.click(screen.getByRole('button', { name: 'Jadwalkan' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const payload = onSubmit.mock.calls[0][0]
    expect(payload.status).toBe('scheduled')
    expect(new Date(payload.scheduled_at).getFullYear()).toBe(2099)
    expect(new Date(payload.scheduled_at).getHours()).toBe(8)
  })
})
