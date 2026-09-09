import axios from 'axios'
import { api } from './axios.js'

const BATCH_SIZE = 100
const MAX_ARTICLES = 10000

export class ArticleApiError extends Error {
  constructor(message, status = 0, fieldErrors = {}) {
    super(message)
    this.name = 'ArticleApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function normalizeError(error) {
  if (error instanceof ArticleApiError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ArticleApiError(
        'Tidak dapat terhubung ke backend. Pastikan service berjalan di port 8080.',
      )
    }

    const message = error.response.data?.message || 'Permintaan ke server gagal.'
    const fieldErrors = error.response.data?.errors || {}

    return new ArticleApiError(message, error.response.status, fieldErrors)
  }

  return new ArticleApiError(error?.message || 'Terjadi kesalahan yang tidak terduga.')
}

async function request(callback) {
  try {
    return await callback()
  } catch (error) {
    throw normalizeError(error)
  }
}

export async function getArticles(limit = BATCH_SIZE, offset = 0) {
  return request(async () => {
    const response = await api.get(`/article/${limit}/${offset}`)
    return Array.isArray(response.data) ? response.data : []
  })
}

export async function getAllArticles() {
  const articles = []

  for (let offset = 0; offset < MAX_ARTICLES; offset += BATCH_SIZE) {
    const batch = await getArticles(BATCH_SIZE, offset)
    articles.push(...batch)

    if (batch.length < BATCH_SIZE) {
      break
    }
  }

  return articles
}

export async function getArticleById(id) {
  return request(async () => {
    const response = await api.get(`/article/${id}`)
    return response.data
  })
}

export async function createArticle(payload) {
  return request(async () => {
    const response = await api.post('/article/', payload)
    return response.data
  })
}

export async function updateArticle(id, payload) {
  return request(async () => {
    const response = await api.put(`/article/${id}`, payload)
    return response.data
  })
}

export async function deleteArticle(id) {
  return request(async () => {
    await api.delete(`/article/${id}`)
  })
}

export async function getServiceHealth() {
  return request(async () => {
    const response = await api.get('/health/ready', { timeout: 5000 })
    return response.data
  })
}

export function toArticlePayload(article, status = article.status) {
  return {
    title: article.title,
    content: article.content,
    category: article.category,
    status,
  }
}

