import { useMemo, useState } from 'react'
import { CalendarClock, FileCheck2, FileClock, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../api/errors.js'
import {
  estimateReadingMinutes,
  formatArticleDate,
  fromLocalInput,
  parseTags,
  readingLabel,
  toLocalInput,
} from '../../utils/articleUtils.js'
import CoverField from '../studio/CoverField.jsx'
import MarkdownEditor from '../studio/MarkdownEditor.jsx'
import Button from '../ui/Button.jsx'

const EMPTY_VALUES = {
  title: '',
  content: '',
  category_id: '',
  tags: '',
  cover_image: '',
}

const MAX_TAGS = 10

function validateField(name, value) {
  const normalized = String(value ?? '').trim()

  if (name === 'title') {
    if (!normalized) return 'Title wajib diisi.'
    if (normalized.length < 20) return 'Title minimal 20 karakter.'
    if (normalized.length > 200) return 'Title maksimal 200 karakter.'
  }

  if (name === 'content') {
    if (!normalized) return 'Content wajib diisi.'
    if (normalized.length < 200) return 'Content minimal 200 karakter.'
    if (normalized.length > 100000) return 'Content maksimal 100.000 karakter.'
  }

  if (name === 'category_id') {
    if (!normalized) return 'Pilih category.'
  }

  if (name === 'tags') {
    const tags = parseTags(normalized)
    if (tags.length > MAX_TAGS) return `Tag maksimal ${MAX_TAGS}.`
    if (tags.some((tag) => tag.length < 2 || tag.length > 50)) return 'Setiap tag 2 sampai 50 karakter.'
  }

  return ''
}

// validateSchedule memeriksa waktu terbit terjadwal: wajib dan di masa depan.
function validateSchedule(value) {
  const iso = fromLocalInput(value)
  if (!iso) return 'Pilih waktu terbit.'
  if (new Date(iso) <= new Date()) return 'Waktu terbit harus di masa depan.'
  return ''
}

const STATUS_NAMES = {
  draft: 'Draft',
  scheduled: 'Terjadwal',
  published: 'Terbit',
  archived: 'Di trash',
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

const inputClass = 'focus-ring mt-2 min-h-12 w-full rounded-xl border border-border bg-bg-primary px-4 text-base text-text-primary placeholder:text-text-tertiary hover:border-text-tertiary'

export default function ArticleForm({ categories = [], initialValues, currentStatus, scheduledAt, onSubmit }) {
  const [values, setValues] = useState(() => ({
    ...EMPTY_VALUES,
    ...initialValues,
  }))
  const [scheduling, setScheduling] = useState(currentStatus === 'scheduled')
  const [scheduleAt, setScheduleAt] = useState(() => toLocalInput(scheduledAt))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submittingStatus, setSubmittingStatus] = useState('')

  const contentLength = values.content.trim().length
  const isSubmitting = Boolean(submittingStatus)

  const checklist = useMemo(() => [
    { label: 'Judul minimal 20 karakter', done: values.title.trim().length >= 20 },
    { label: 'Isi minimal 200 karakter', done: contentLength >= 200 },
    { label: 'Category dipilih', done: Boolean(values.category_id) },
    { label: 'Gambar sampul (opsional)', done: Boolean(values.cover_image), optional: true },
  ], [values, contentLength])
  const completion = checklist.filter((item) => !item.optional && item.done).length

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
    if (status === 'scheduled') {
      const message = validateSchedule(scheduleAt)
      if (message) validationErrors.scheduled_at = message
    }
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
        category_id: Number(values.category_id),
        tags: parseTags(values.tags),
        cover_image: values.cover_image,
        status,
        ...(status === 'scheduled' && { scheduled_at: fromLocalInput(scheduleAt) }),
      })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors((current) => ({ ...current, ...error.fields }))
        setFormError(error.message)

        const firstServerField = Object.keys(error.fields)[0]
        if (firstServerField) document.getElementById(firstServerField)?.focus()
      } else {
        setFormError('Artikel belum dapat disimpan. Silakan coba lagi.')
      }
    } finally {
      setSubmittingStatus('')
    }
  }

  return (
    <form className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" onSubmit={(event) => event.preventDefault()} noValidate>
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
            <span className={`text-xs tabular-nums ${values.title.length > 200 ? 'text-danger' : 'text-text-tertiary'}`}>
              {values.title.length}/200
            </span>
          </div>
          <input
            id="title"
            name="title"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${inputClass} font-display text-2xl font-semibold`}
            placeholder="Judul yang jelas dan memikat"
            aria-invalid={Boolean(errors.title)}
            aria-describedby="title-error"
            maxLength={210}
          />
          <FieldError id="title-error" message={errors.title} />
        </div>

        <div className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <label htmlFor="content" className="text-sm font-semibold text-text-primary">
              Content <span className="text-accent-strong" aria-hidden="true">*</span>
              <span className="sr-only">(wajib)</span>
            </label>
            <span className={`text-xs tabular-nums ${contentLength < 200 && contentLength > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-text-tertiary'}`}>
              {contentLength} karakter · {readingLabel(estimateReadingMinutes(values.content))}
            </span>
          </div>
          <MarkdownEditor
            id="content"
            name="content"
            value={values.content}
            onChange={handleChange}
            onBlur={handleBlur}
            invalid={Boolean(errors.content)}
            describedBy="content-help content-error"
          />
          <p id="content-help" className="mt-2 text-xs text-text-tertiary">
            Mendukung Markdown. Minimal 200 karakter.
          </p>
          <FieldError id="content-error" message={errors.content} />
        </div>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-2xl border border-border bg-bg-secondary p-5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-bg-soft text-text-secondary">
              <Save aria-hidden="true" size={19} />
            </span>
            <div>
              <h2 className="font-semibold text-text-primary">Terbitkan</h2>
              <p className="text-xs text-text-tertiary">
                {!currentStatus ? 'Artikel baru'
                  : currentStatus === 'scheduled' && scheduledAt
                    ? `Terjadwal ${formatArticleDate(scheduledAt, { month: 'long', hour: '2-digit', minute: '2-digit' })}`
                    : `Status saat ini: ${STATUS_NAMES[currentStatus] || currentStatus}`}
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-sm" aria-label={`Kelengkapan ${completion} dari 3`}>
            {checklist.map((item) => (
              <li key={item.label} className={`flex items-center gap-2 ${item.done ? 'text-text-primary' : 'text-text-tertiary'}`}>
                <span aria-hidden="true" className={`grid size-4 place-items-center rounded-full text-[10px] ${item.done ? 'bg-success text-white dark:text-zinc-950' : 'border border-border'}`}>
                  {item.done ? '✓' : ''}
                </span>
                {item.label}
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-xl border border-border p-3">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-text-primary">
              <input
                type="checkbox"
                checked={scheduling}
                onChange={(event) => {
                  setScheduling(event.target.checked)
                  setErrors((current) => ({ ...current, scheduled_at: '' }))
                }}
                className="size-4 cursor-pointer accent-current"
              />
              Jadwalkan terbit
            </label>
            {scheduling && (
              <div className="mt-3">
                <label htmlFor="scheduled_at" className="text-xs font-semibold text-text-secondary">Waktu terbit</label>
                <input
                  id="scheduled_at"
                  type="datetime-local"
                  value={scheduleAt}
                  min={toLocalInput(new Date())}
                  onChange={(event) => {
                    setScheduleAt(event.target.value)
                    if (errors.scheduled_at) setErrors((current) => ({ ...current, scheduled_at: validateSchedule(event.target.value) }))
                  }}
                  className={`${inputClass} min-h-11 text-sm`}
                  aria-invalid={Boolean(errors.scheduled_at)}
                  aria-describedby="scheduled_at-help scheduled_at-error"
                />
                <p id="scheduled_at-help" className="mt-2 text-xs leading-5 text-text-tertiary">
                  Menurut jam perangkatmu. Artikel terbit otomatis paling lambat satu menit setelahnya
                  {currentStatus === 'published' && ', dan disembunyikan sampai saat itu'}.
                </p>
                <FieldError id="scheduled_at-error" message={errors.scheduled_at} />
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3">
            {scheduling ? (
              <Button
                type="button"
                variant="primary"
                loading={submittingStatus === 'scheduled'}
                disabled={isSubmitting}
                onClick={() => handleSubmit('scheduled')}
                className="w-full"
              >
                <CalendarClock aria-hidden="true" size={18} />
                Jadwalkan
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                loading={submittingStatus === 'published'}
                disabled={isSubmitting}
                onClick={() => handleSubmit('published')}
                className="w-full"
              >
                <FileCheck2 aria-hidden="true" size={18} />
                Publish
              </Button>
            )}
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
              to="/studio/artikel"
              className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl text-sm font-semibold text-text-secondary transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary"
            >
              Batal
            </Link>
          </div>
        </section>

        <section className="space-y-5 rounded-2xl border border-border bg-bg-secondary p-5 shadow-card">
          <CoverField
            value={values.cover_image}
            onChange={(url) => setValues((current) => ({ ...current, cover_image: url }))}
            error={errors.cover_image}
          />

          <div>
            <label htmlFor="category_id" className="text-sm font-semibold text-text-primary">
              Category <span className="text-accent-strong" aria-hidden="true">*</span>
              <span className="sr-only">(wajib)</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              value={values.category_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputClass} cursor-pointer`}
              aria-invalid={Boolean(errors.category_id)}
              aria-describedby="category-help category_id-error"
            >
              <option value="">Pilih category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <p id="category-help" className="mt-2 text-xs text-text-tertiary">
                Belum ada category. Admin bisa membuatnya di menu Kategori.
              </p>
            )}
            <FieldError id="category_id-error" message={errors.category_id} />
          </div>

          <div>
            <label htmlFor="tags" className="text-sm font-semibold text-text-primary">Tags</label>
            <input
              id="tags"
              name="tags"
              value={values.tags}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
              placeholder="golang, backend"
              aria-invalid={Boolean(errors.tags)}
              aria-describedby="tags-help tags-error"
            />
            <p id="tags-help" className="mt-2 text-xs text-text-tertiary">
              Pisahkan dengan koma, paling banyak 10. Tag baru dibuat otomatis.
            </p>
            <FieldError id="tags-error" message={errors.tags} />
          </div>
        </section>
      </aside>
    </form>
  )
}
