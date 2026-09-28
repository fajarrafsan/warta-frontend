import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './client.js'
import { ApiError } from './errors.js'
import { changeArticleStatus, listArticles, toArticlePayload } from './articleApi.js'

vi.mock('./client.js', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('articleApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('memakai nama parameter backend dan membuang yang kosong', async () => {
    api.get.mockResolvedValue({ data: { data: [], meta: { total: 0 } } })

    await listArticles({ status: 'draft', q: '', perPage: 5, page: 2, category: undefined })

    expect(api.get).toHaveBeenCalledWith('/api/v1/articles', {
      params: { status: 'draft', per_page: 5, page: 2 },
    })
  })

  it('mengambil artikel milik sendiri dari /me/articles beserta meta', async () => {
    const meta = { page: 1, per_page: 10, total: 1, total_pages: 1 }
    api.get.mockResolvedValue({ data: { data: [{ id: 1 }], meta } })

    const result = await listArticles({}, { mine: true })

    expect(api.get).toHaveBeenCalledWith('/api/v1/me/articles', { params: {} })
    expect(result).toEqual({ data: [{ id: 1 }], meta })
  })

  it('mengubah status lewat PATCH', async () => {
    api.patch.mockResolvedValue({ data: { data: { id: 9, status: 'archived' } } })

    const result = await changeArticleStatus(9, 'archived')

    expect(api.patch).toHaveBeenCalledWith('/api/v1/articles/9', { status: 'archived' })
    expect(result.status).toBe('archived')
  })

  it('menerjemahkan error backend menjadi ApiError dengan rincian field', async () => {
    const error = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      response: {
        status: 422,
        data: { error: { code: 'validation_failed', message: 'validasi gagal', fields: { title: 'title minimal 20 karakter' } } },
      },
    })
    api.patch.mockRejectedValue(error)

    const failure = await changeArticleStatus(1, 'published').catch((caught) => caught)

    expect(failure).toBeInstanceOf(ApiError)
    expect(failure.status).toBe(422)
    expect(failure.fields).toEqual({ title: 'title minimal 20 karakter' })
  })

  it('membentuk payload PUT dari response artikel', () => {
    const article = {
      id: 4,
      title: 'Judul artikel pengujian yang lengkap',
      content: 'Isi artikel panjang',
      category: { id: 3, name: 'Teknologi', slug: 'teknologi' },
      tags: [{ id: 1, name: 'golang', slug: 'golang' }],
      status: 'published',
      created_at: '2026-01-01T00:00:00Z',
    }

    expect(toArticlePayload(article, 'archived')).toEqual({
      title: article.title,
      content: article.content,
      category_id: 3,
      tags: ['golang'],
      status: 'archived',
    })
  })
})
