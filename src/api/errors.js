import axios from 'axios'

export class ApiError extends Error {
  constructor(message, { status = 0, code = '', fields = {} } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

export function toApiError(error) {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError('Tidak dapat terhubung ke backend. Pastikan service Warta sedang berjalan.')
    }

    const body = error.response.data?.error
    return new ApiError(body?.message || 'Permintaan ke server gagal.', {
      status: error.response.status,
      code: body?.code || '',
      fields: body?.fields || {},
    })
  }

  return new ApiError(error?.message || 'Terjadi kesalahan yang tidak terduga.')
}

// call menjalankan request dan menyeragamkan error-nya menjadi ApiError.
export async function call(request) {
  try {
    return await request()
  } catch (error) {
    throw toApiError(error)
  }
}
