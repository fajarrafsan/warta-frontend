import { useMemo, useState } from 'react'
import { FileCheck2, FileClock, Info, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ArticleApiError } from '../../api/articleApi.js'
import Button from '../ui/Button.jsx'

const EMPTY_VALUES = {
  title: '',
  content: '',
  category: '',
}

function validateField(name, value) {
  const normalized = value.trim()

  if (name === 'title') {
    if (!normalized) return 'Title wajib diisi.'
    if (normalized.length < 20) return 'Title minimal 20 karakter.'
    if (normalized.length > 200) return 'Title maksimal 200 karakter.'
  }

  if (name === 'content') {
    if (!normalized) return 'Content wajib diisi.'
    if (normalized.length < 200) return 'Content minimal 200 karakter.'
  }

  if (name === 'category') {
    if (!normalized) return 'Category wajib diisi.'
    if (normalized.length < 3) return 'Category minimal 3 karakter.'
    if (normalized.length > 100) return 'Category maksimal 100 karakter.'
  }

  return ''
}

function validateForm(values) {
  return Object.keys(values).reduce((result, field) => {
    const message = validateField(field, values[field])
    if (message) result[field] = message
    return result
  }, {})
}

function FieldError({ id, message }) {
  if (!message) return null

  return (
    <p id={id} className="mt-2 text-sm font-medium text-danger" role="alert">
      {message}
    </p>
  )
}

export default function ArticleForm({ initialValues, currentStatus, onSubmit }) {
  const [values, setValues] = useState(() => ({
    ...EMPTY_VALUES,
    ...initialValues,
  }))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submittingStatus, setSubmittingStatus] = useState('')

  const titleLength = values.title.length
  const contentLength = values.content.trim().length
  const isSubmitting = Boolean(submittingStatus)

  const completion = useMemo(() => {
    return [
      values.title.trim().length >= 20,
      values.content.trim().length >= 200,
      values.category.trim().length >= 3,
    ].filter(Boolean).length
  }, [values])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: validateField(name, value),
      }))
    }
  }

  function handleBlur(event) {
    const { name, value } = event.target
    setErrors((current) => ({
      ...current,
      [name]: validateField(name, value),
    }))
  }

  async function handleSubmit(status) {
    const validationErrors = validateForm(values)
    setErrors(validationErrors)
    setFormError('')

    if (Object.keys(validationErrors).length > 0) {
      const firstInvalidField = Object.keys(validationErrors)[0]
      document.getElementById(firstInvalidField)?.focus()
      return
    }

    setSubmittingStatus(status)

    try {
      await onSubmit({
        title: values.title.trim(),
        content: values.content.trim(),
        category: values.category.trim(),
        status,
      })
    } catch (error) {
      if (error instanceof ArticleApiError) {
        setErrors((current) => ({ ...current, ...error.fieldErrors }))
        setFormError(error.message)

        const firstServerField = Object.keys(error.fieldErrors)[0]
        if (firstServerField) document.getElementById(firstServerField)?.focus()
      } else {
        setFormError('Artikel belum dapat disimpan. Silakan coba lagi.')
      }
    } finally {
      setSubmittingStatus('')
    }
  }

  return (
    <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]" onSubmit={(event) => event.preventDefault()} noValidate>
      <div className="rounded-2xl border border-border bg-bg-secondary p-5 shadow-card sm:p-7">
        {formError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-950 dark:bg-red-950/30 dark:text-red-100" role="alert">
            <p className="font-semibold">Artikel belum tersimpan</p>
            <p className="mt-1 opacity-80">{formError}</p>
          </div>
        )}

        <div>
          <div className="flex items-end justify-between gap-4">
            <label htmlFor="title" className="text-sm font-semibold text-text-primary">
              Title <span className="text-accent-strong" aria-hidden="true">*</span>
              <span className="sr-only">(wajib)</span>
            </label>
            <span className={`text-xs tabular-nums ${titleLength > 200 ? 'text-danger' : 'text-text-tertiary'}`}>
              {titleLength}/200
            </span>
          </div>
          <input
            id="title"
            name="title"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-border bg-bg-primary px-4 text-base text-text-primary placeholder:text-text-tertiary hover:border-text-tertiary"
            placeholder="Contoh: Panduan Membangun REST API yang Andal"
            aria-invalid={Boolean(errors.title)}
            aria-describedby="title-help title-error"
            maxLength={210}
          />
          <p id="title-help" className="mt-2 text-xs text-text-tertiary">
            Gunakan judul yang jelas, minimal 20 karakter.
          </p>
          <FieldError id="title-error" message={errors.title} />
        </div>

        <div className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <label htmlFor="content" className="text-sm font-semibold text-text-primary">
              Content <span className="text-accent-strong" aria-hidden="true">*</span>
              <span className="sr-only">(wajib)</span>
            </label>
            <span className={`text-xs tabular-nums ${contentLength < 200 && contentLength > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-text-tertiary'}`}>
              {contentLength} karakter
            </span>
          </div>
          <textarea
            id="content"
            name="content"
            value={values.content}
            onChange={handleChange}
            onBlur={handleBlur}
            className="focus-ring mt-2 min-h-72 w-full resize-y rounded-xl border border-border bg-bg-primary px-4 py-3 text-base leading-7 text-text-primary placeholder:text-text-tertiary hover:border-text-tertiary"
            placeholder="Tulis isi artikel di sini..."
            aria-invalid={Boolean(errors.content)}
            aria-describedby="content-help content-error"
          />
          <p id="content-help" className="mt-2 text-xs text-text-tertiary">
            Content wajib memiliki sedikitnya 200 karakter.
          </p>
          <FieldError id="content-error" message={errors.content} />
        </div>

        <div className="mt-6">
          <label htmlFor="category" className="text-sm font-semibold text-text-primary">
            Category <span className="text-accent-strong" aria-hidden="true">*</span>
            <span className="sr-only">(wajib)</span>
          </label>
          <input
            id="category"
            name="category"
            value={values.category}
            onChange={handleChange}
            onBlur={handleBlur}
            className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-border bg-bg-primary px-4 text-base text-text-primary placeholder:text-text-tertiary hover:border-text-tertiary"
            placeholder="Teknologi"
            list="category-suggestions"
            aria-invalid={Boolean(errors.category)}
            aria-describedby="category-help category-error"
            maxLength={110}
          />
          <datalist id="category-suggestions">
            <option value="Teknologi" />
            <option value="Pemrograman" />
            <option value="Backend" />
            <option value="Frontend" />
            <option value="Bisnis" />
          </datalist>
          <p id="category-help" className="mt-2 text-xs text-text-tertiary">
            Category terdiri dari 3 sampai 100 karakter.
          </p>
          <FieldError id="category-error" message={errors.category} />
        </div>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-2xl border border-border bg-bg-secondary p-5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-bg-soft text-text-secondary">
              <Save aria-hidden="true" size={19} />
            </span>
            <div>
              <h2 className="font-semibold text-text-primary">Publication</h2>
              <p className="text-xs text-text-tertiary">
                {currentStatus ? `Status saat ini: ${currentStatus}` : 'Artikel baru'}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-bg-soft p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span>Kelengkapan</span>
              <span className="tabular-nums">{completion}/3</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300"
                style={{ width: `${(completion / 3) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <Button
              type="button"
              variant="primary"
              loading={submittingStatus === 'publish'}
              disabled={isSubmitting}
              onClick={() => handleSubmit('publish')}
              className="w-full"
            >
              <FileCheck2 aria-hidden="true" size={18} />
              Publish
            </Button>
            <Button
              type="button"
              variant="secondary"
              loading={submittingStatus === 'draft'}
              disabled={isSubmitting}
              onClick={() => handleSubmit('draft')}
              className="w-full"
            >
              <FileClock aria-hidden="true" size={18} />
              Simpan Draft
            </Button>
            <Link
              to="/posts"
              className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl text-sm font-semibold text-text-secondary transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary"
            >
              Batal
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-bg-soft p-5">
          <div className="flex items-start gap-3">
            <Info aria-hidden="true" className="mt-0.5 shrink-0 text-accent-strong" size={18} />
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Sebelum publish</h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Periksa kembali judul, keterbacaan content, dan category agar artikel mudah ditemukan.
              </p>
            </div>
          </div>
        </section>
      </aside>
    </form>
  )
}

