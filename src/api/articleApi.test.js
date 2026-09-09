import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from './axios.js'
import {
  getAllArticles,
  toArticlePayload,
  updateArticle,
} from './articleApi.js'

vi.mock('./axios.js', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('articleApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mengambil seluruh batch article sampai batch terakhir', async () => {
    const firstBatch = Array.from({ length: 100 }, (_, index) => ({ id: index + 1 }))
    const lastBatch = [{ id: 101 }]

    api.get
      .mockResolvedValueOnce({ data: firstBatch })
      .mockResolvedValueOnce({ data: lastBatch })

    const result = await getAllArticles()

    expect(result).toHaveLength(101)
    expect(api.get).toHaveBeenNthCalledWith(1, '/article/100/0')
    expect(api.get).toHaveBeenNthCalledWith(2, '/article/100/100')
  })

  it('mengirim update article lengkap ke backend', async () => {
    const payload = {
      title: 'Judul artikel pengujian yang lengkap',
      content: 'Isi artikel',
      category: 'Testing',
      status: 'draft',
    }
    api.put.mockResolvedValue({ data: { id: 9, ...payload } })

    const result = await updateArticle(9, payload)

    expect(api.put).toHaveBeenCalledWith('/article/9', payload)
    expect(result.status).toBe('draft')
  })

  it('membentuk payload perubahan status tanpa field response-only', () => {
    const article = {
      id: 4,
      title: 'Judul artikel pengujian yang lengkap',
      content: 'Isi artikel panjang',
      category: 'Testing',
      status: 'publish',
      created_date: '2026-01-01T00:00:00Z',
    }

    expect(toArticlePayload(article, 'thrash')).toEqual({
      title: article.title,
      content: article.content,
      category: article.category,
      status: 'thrash',
    })
  })
})

