import { useLayoutEffect, useRef, useState } from 'react'
import { formatCount } from '../../utils/articleUtils.js'

const HEIGHT = 220
const PAD = { top: 16, right: 12, bottom: 28, left: 40 }

function useWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(600)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

// niceMax membulatkan nilai tertinggi ke angka yang enak dibaca untuk sumbu.
function niceMax(value) {
  if (value <= 4) return 4
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude * 4 >= value) * magnitude
  return step * 4
}

const shortDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
const longDate = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
const parseDay = (date) => new Date(`${date}T00:00:00`)

// TimeSeriesChart menggambar satu seri per hari sebagai area (garis 2px dengan
// isian tipis) atau kolom. Hover menampilkan tanggal dan nilai.
export function TimeSeriesChart({ data, valueKey, color, kind = 'area', unit, label }) {
  const [ref, width] = useWidth()
  const [hover, setHover] = useState(null)

  const values = data.map((d) => d[valueKey])
  const max = niceMax(Math.max(0, ...values))
  const innerW = width - PAD.left - PAD.right
  const innerH = HEIGHT - PAD.top - PAD.bottom
  const step = innerW / Math.max(1, data.length)
  const x = (i) => PAD.left + step * i + step / 2
  const y = (v) => PAD.top + innerH - (v / max) * innerH
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f))
  const labelEvery = Math.ceil(data.length / Math.max(2, Math.floor(innerW / 70)))

  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d[valueKey])}`).join(' ')
  const area = `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`
  const barWidth = Math.min(24, Math.max(2, step - 2))

  function onMove(event) {
    const box = event.currentTarget.getBoundingClientRect()
    const index = Math.floor((event.clientX - box.left - PAD.left) / step)
    setHover(index >= 0 && index < data.length ? index : null)
  }

  const total = values.reduce((sum, v) => sum + v, 0)
  const hovered = hover !== null ? data[hover] : null

  return (
    <div ref={ref} className="relative">
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`${label}: total ${total} dalam ${data.length} hari, tertinggi ${Math.max(0, ...values)}`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        className="block"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth="1" />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-text-tertiary text-[11px] tabular-nums">
              {formatCount(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => (i % labelEvery === 0 || i === data.length - 1) && (
          <text key={d.date} x={x(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-text-tertiary text-[11px]">
            {shortDate.format(parseDay(d.date))}
          </text>
        ))}

        {kind === 'area' ? (
          <>
            <path d={area} fill={color} fillOpacity="0.1" />
            <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(data.length - 1)} cy={y(values.at(-1))} r="4" fill={color} stroke="var(--bg-secondary)" strokeWidth="2" />
          </>
        ) : (
          data.map((d, i) => {
            const v = d[valueKey]
            if (!v) return null
            const top = y(v)
            const h = y(0) - top
            const r = Math.min(4, h, barWidth / 2)
            const left = x(i) - barWidth / 2
            // Ujung atas membulat 4px, dasar tetap siku.
            const path = `M${left},${y(0)} V${top + r} Q${left},${top} ${left + r},${top} H${left + barWidth - r} Q${left + barWidth},${top} ${left + barWidth},${top + r} V${y(0)} Z`
            return <path key={d.date} d={path} fill={color} opacity={hover === null || hover === i ? 1 : 0.55} />
          })
        )}

        {hovered && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={y(0)} stroke="var(--text-tertiary)" strokeWidth="1" />
            {kind === 'area' && <circle cx={x(hover)} cy={y(hovered[valueKey])} r="5" fill={color} stroke="var(--bg-secondary)" strokeWidth="2" />}
          </g>
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-lg border border-border bg-bg-secondary px-3 py-2 text-xs shadow-float"
          style={{ left: Math.min(Math.max(x(hover) - 70, 0), width - 150), width: 140 }}
        >
          <p className="text-text-tertiary">{longDate.format(parseDay(hovered.date))}</p>
          <p className="mt-1 flex items-center gap-2 font-semibold text-text-primary">
            <span aria-hidden="true" className="size-2 rounded-full" style={{ background: color }} />
            <span className="tabular-nums">{formatCount(hovered[valueKey])}</span> {unit}
          </p>
        </div>
      )}
    </div>
  )
}

// RankedBars adalah batang horizontal untuk daftar peringkat, nilai di ujung batang.
export function RankedBars({ items, color, unit }) {
  const max = Math.max(1, ...items.map((item) => item.value))
  const [hover, setHover] = useState(null)

  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li
          key={item.key}
          onMouseEnter={() => setHover(index)}
          onMouseLeave={() => setHover(null)}
          title={`${item.name}: ${item.value} ${unit}`}
        >
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium text-text-primary">{item.label}</span>
            <span className="shrink-0 tabular-nums text-text-secondary">{formatCount(item.value)} {unit}</span>
          </div>
          <div className="mt-1.5 h-2.5 rounded-r bg-transparent">
            <div
              className="h-full rounded-r-[4px] transition-opacity"
              style={{ width: `${Math.max(1.5, (item.value / max) * 100)}%`, background: color, opacity: hover === null || hover === index ? 1 : 0.55 }}
            />
          </div>
          {item.detail && <p className="mt-1 text-xs text-text-tertiary">{item.detail}</p>}
        </li>
      ))}
    </ol>
  )
}
