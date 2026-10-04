import { useState } from 'react'
import { Bookmark, Eye, FilePlus2, FileText, Heart, MessageSquare, Table2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getStats } from '../api/articleApi.js'
import { RankedBars, TimeSeriesChart } from '../components/studio/charts.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import useAsync from '../hooks/useAsync.js'
import useAuth from '../hooks/useAuth.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { formatCount, ROLE_LABELS } from '../utils/articleUtils.js'

const RANGES = [7, 30, 90]

function StatTile({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-secondary p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{label}</p>
        <Icon aria-hidden="true" size={18} className="text-text-tertiary" />
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-text-primary">{formatCount(value)}</p>
      {detail && <p className="mt-1 text-xs text-text-tertiary">{detail}</p>}
    </div>
  )
}

function Panel({ title, description, children, action }) {
  return (
    <section className="rounded-2xl border border-border bg-bg-secondary p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-text-primary">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-text-tertiary">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function DailyTable({ daily }) {
  return (
    <div className="max-h-80 overflow-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-bg-soft text-xs uppercase tracking-wide text-text-tertiary">
          <tr>
            <th scope="col" className="px-4 py-2 font-semibold">Tanggal</th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">Dibaca</th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">Komentar</th>
            <th scope="col" className="px-4 py-2 text-right font-semibold">Terbit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border tabular-nums">
          {[...daily].reverse().map((day) => (
            <tr key={day.date}>
              <td className="px-4 py-2 text-text-secondary">{day.date}</td>
              <td className="px-4 py-2 text-right text-text-primary">{day.views}</td>
              <td className="px-4 py-2 text-right text-text-primary">{day.comments}</td>
              <td className="px-4 py-2 text-right text-text-primary">{day.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const [days, setDays] = useState(30)
  const [asTable, setAsTable] = useState(false)
  const stats = useAsync(() => getStats(days), [days])
  const data = stats.data

  const sum = (key) => (data?.daily ?? []).reduce((total, day) => total + day[key], 0)

  return (
    <div className="animate-fade-up space-y-7">
      <PageHeader
        eyebrow={data?.scope === 'all' ? 'Semua penulis' : 'Artikel kamu'}
        title={`Halo, ${user.name.split(' ')[0]}`}
        description="Ringkasan tulisan dan pembaca di Warta."
      >
        <Link
          to="/studio/tulis"
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand bg-brand px-5 text-sm font-semibold text-brand-contrast hover:opacity-90"
        >
          <FilePlus2 aria-hidden="true" size={18} />
          Tulis artikel
        </Link>
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl border border-border bg-bg-secondary p-1" role="group" aria-label="Rentang waktu">
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDays(range)}
              aria-pressed={days === range}
              className={`focus-ring min-h-9 cursor-pointer rounded-lg px-4 text-sm font-semibold ${days === range ? 'bg-brand text-brand-contrast' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {range} hari
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAsTable((current) => !current)}
          aria-pressed={asTable}
          className="focus-ring inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-border bg-bg-secondary px-4 text-sm font-semibold text-text-secondary hover:text-text-primary"
        >
          <Table2 aria-hidden="true" size={16} />
          {asTable ? 'Tampilkan grafik' : 'Tampilkan tabel'}
        </button>
      </div>

      {stats.error ? (
        <ErrorState error={stats.error} onRetry={stats.refresh} />
      ) : !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6" role="status" aria-label="Memuat statistik">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-bg-secondary" />)}
        </div>
      ) : (
        <>
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 transition-opacity ${stats.loading ? 'opacity-60' : ''}`}>
            <StatTile
              icon={FileText}
              label="Artikel terbit"
              value={data.totals.published}
              detail={[
                data.totals.scheduled > 0 && `${data.totals.scheduled} terjadwal`,
                `${data.totals.draft} draft`,
                `${data.totals.archived} di trash`,
              ].filter(Boolean).join(' · ')}
            />
            <StatTile icon={Eye} label="Total dibaca" value={data.totals.views} detail={`${formatCount(sum('views'))} dalam ${days} hari`} />
            <StatTile icon={Heart} label="Suka" value={data.totals.likes} />
            <StatTile icon={MessageSquare} label="Komentar" value={data.totals.comments} detail={`${formatCount(sum('comments'))} dalam ${days} hari`} />
            <StatTile icon={Bookmark} label="Disimpan pembaca" value={data.totals.bookmarks} />
            <StatTile icon={Users} label={data.scope === 'all' ? 'Relasi ikuti' : 'Pengikut'} value={data.totals.followers} />
          </div>

          {asTable ? (
            <Panel title="Aktivitas harian" description="Tanggal dalam UTC">
              <DailyTable daily={data.daily} />
            </Panel>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Panel title="Dibaca per hari" description={`${days} hari terakhir, tanggal dalam UTC`}>
                <TimeSeriesChart data={data.daily} valueKey="views" color="var(--chart-views)" unit="dibaca" label="Dibaca per hari" />
              </Panel>
              <Panel title="Komentar per hari" description={`${days} hari terakhir`}>
                <TimeSeriesChart data={data.daily} valueKey="comments" color="var(--chart-comments)" kind="column" unit="komentar" label="Komentar per hari" />
              </Panel>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Panel title="Artikel terpopuler" description="Menimbang dibaca, suka, dan komentar">
              {data.top_articles.length === 0 ? (
                <p className="text-sm text-text-tertiary">Belum ada artikel terbit.</p>
              ) : (
                <RankedBars
                  color="var(--chart-views)"
                  unit="dibaca"
                  items={data.top_articles.map((article) => ({
                    key: article.id,
                    name: article.title,
                    label: <Link to={`/artikel/${article.slug}`} className="focus-ring rounded hover:underline">{article.title}</Link>,
                    value: article.views,
                    detail: `${formatCount(article.likes)} suka · ${formatCount(article.comments)} komentar`,
                  }))}
                />
              )}
            </Panel>

            {data.users && (
              <Panel title="Pengguna" description="Jumlah akun per role">
                <dl className="divide-y divide-border">
                  {Object.entries(ROLE_LABELS).map(([role, name]) => (
                    <div key={role} className="flex items-center justify-between py-3">
                      <dt className="text-sm text-text-secondary">{name}</dt>
                      <dd className="text-lg font-semibold tabular-nums text-text-primary">{formatCount(data.users[role])}</dd>
                    </div>
                  ))}
                </dl>
                <Link to="/studio/pengguna" className="focus-ring mt-3 inline-block rounded text-sm font-semibold text-text-primary hover:underline">
                  Kelola pengguna
                </Link>
              </Panel>
            )}
          </div>
        </>
      )}
    </div>
  )
}
