import { useState, useRef } from 'react'
import { FlaskConical, Search, Loader2, AlertCircle, TrendingUp } from 'lucide-react'
import { useLabTrends } from '../hooks/useLabTrends'

// ── Presets ───────────────────────────────────────────────────────────────────

const PRESETS = ['HbA1c', 'Glucose', 'Creatinine', 'Hemoglobin', 'WBC', 'Cholesterol', 'eGFR']

// ── Flag styling ──────────────────────────────────────────────────────────────

const FLAG_STYLE = {
  HIGH:     { fill: '#ef4444', stroke: '#dc2626', label: 'bg-red-50 text-red-600 border-red-100' },
  LOW:      { fill: '#3b82f6', stroke: '#2563eb', label: 'bg-sky-50 text-sky-600 border-sky-100' },
  CRITICAL: { fill: '#7f1d1d', stroke: '#991b1b', label: 'bg-red-100 text-red-800 border-red-200' },
  NORMAL:   { fill: '#10b981', stroke: '#059669', label: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
}
const DOT_DEFAULT = { fill: '#0284c7', stroke: '#0369a1' }

function getDotStyle(flag) {
  return FLAG_STYLE[flag?.toUpperCase()] ?? DOT_DEFAULT
}

// ── Reference range parser ────────────────────────────────────────────────────

function parseRefRange(str) {
  if (!str) return null
  const m = str.match(/([\d.]+)\s*[-–]\s*([\d.]+)/)
  if (!m) return null
  return { lo: parseFloat(m[1]), hi: parseFloat(m[2]) }
}

// ── Date formatter ─────────────────────────────────────────────────────────────

function shortDate(dateStr) {
  if (!dateStr) return '?'
  const d = new Date(`${dateStr}T00:00:00`)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d)
}

function fullDate(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(`${dateStr}T00:00:00`))
}

// ── SVG Line Chart ─────────────────────────────────────────────────────────────

const PAD = { left: 52, right: 20, top: 18, bottom: 42 }
const VB_W = 580
const VB_H = 220
const CHART_W = VB_W - PAD.left - PAD.right
const CHART_H = VB_H - PAD.top - PAD.bottom

function niceRange(min, max) {
  if (min === max) { return { lo: min - 1, hi: max + 1 } }
  const pad = (max - min) * 0.15
  return { lo: min - pad, hi: max + pad }
}

function LabLineChart({ points, unit, refRange }) {
  const [tooltip, setTooltip] = useState(null)
  const svgRef = useRef(null)

  // Only plot numeric points
  const numeric = points.filter((p) => p.numeric_value != null)
  if (numeric.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl bg-slate-50">
        <p className="text-sm text-slate-400">No numeric values to chart.</p>
      </div>
    )
  }

  const values = numeric.map((p) => p.numeric_value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const { lo: yLo, hi: yHi } = niceRange(rawMin, rawMax)

  // Reference range parsed + clamped to visible range
  const refBand = (() => {
    if (!refRange) return null
    const first = points.find((p) => p.reference_range)
    const parsed = parseRefRange(first?.reference_range)
    return parsed
  })()

  function toX(i) {
    if (numeric.length === 1) return PAD.left + CHART_W / 2
    return PAD.left + (i / (numeric.length - 1)) * CHART_W
  }
  function toY(v) {
    return PAD.top + (1 - (v - yLo) / (yHi - yLo)) * CHART_H
  }

  // Y axis ticks
  const TICKS = 5
  const yTicks = Array.from({ length: TICKS }, (_, i) => {
    const v = yLo + (i / (TICKS - 1)) * (yHi - yLo)
    return { v, y: toY(v) }
  })

  // X axis labels — show max 6, evenly spaced
  const maxXLabels = Math.min(numeric.length, 6)
  const xLabelIndices = numeric.length <= 6
    ? numeric.map((_, i) => i)
    : Array.from({ length: maxXLabels }, (_, i) =>
        Math.round(i * (numeric.length - 1) / (maxXLabels - 1))
      )

  // Polyline path
  const linePoints = numeric.map((p, i) => `${toX(i)},${toY(p.numeric_value)}`).join(' ')

  // Reference band rect
  const refBandEl = (() => {
    if (!refBand) return null
    const y1 = toY(Math.min(refBand.hi, yHi))
    const y2 = toY(Math.max(refBand.lo, yLo))
    if (y2 <= y1) return null
    return (
      <rect
        x={PAD.left}
        y={y1}
        width={CHART_W}
        height={y2 - y1}
        fill="#10b981"
        fillOpacity={0.07}
        rx={3}
      />
    )
  })()

  return (
    <div className="relative select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full overflow-visible"
        aria-label="Lab value trend chart"
      >
        {/* Grid lines */}
        {yTicks.map(({ y }, i) => (
          <line
            key={i}
            x1={PAD.left}
            x2={PAD.left + CHART_W}
            y1={y}
            y2={y}
            stroke="#f1f5f9"
            strokeWidth={1}
          />
        ))}

        {/* Reference band */}
        {refBandEl}

        {/* Y-axis labels */}
        {yTicks.map(({ v, y }, i) => (
          <text
            key={i}
            x={PAD.left - 6}
            y={y}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={9}
            fill="#94a3b8"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}
          </text>
        ))}

        {/* Unit label */}
        {unit && (
          <text
            x={PAD.left - 6}
            y={PAD.top - 6}
            textAnchor="middle"
            fontSize={8}
            fill="#cbd5e1"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {unit}
          </text>
        )}

        {/* X-axis labels */}
        {xLabelIndices.map((idx) => (
          <text
            key={idx}
            x={toX(idx)}
            y={PAD.top + CHART_H + 14}
            textAnchor="middle"
            fontSize={9}
            fill="#94a3b8"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {shortDate(numeric[idx].event_date)}
          </text>
        ))}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#0284c7" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Area fill */}
        {numeric.length > 1 && (
          <polygon
            points={[
              ...numeric.map((p, i) => `${toX(i)},${toY(p.numeric_value)}`),
              `${toX(numeric.length - 1)},${PAD.top + CHART_H}`,
              `${PAD.left},${PAD.top + CHART_H}`,
            ].join(' ')}
            fill="url(#lineGrad)"
          />
        )}

        {/* Trend line */}
        {numeric.length > 1 && (
          <polyline
            points={linePoints}
            fill="none"
            stroke="#0284c7"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Data point dots */}
        {numeric.map((p, i) => {
          const ds = getDotStyle(p.flag)
          const cx = toX(i)
          const cy = toY(p.numeric_value)
          const isHovered = tooltip?.i === i
          return (
            <g key={p.event_id ?? i}>
              {/* Hit area */}
              <circle
                cx={cx}
                cy={cy}
                r={12}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ i, p, cx, cy })}
                onMouseLeave={() => setTooltip(null)}
              />
              {/* Visible dot */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill={ds.fill}
                stroke="white"
                strokeWidth={isHovered ? 2.5 : 2}
                style={{ transition: 'r 0.1s, stroke-width 0.1s', pointerEvents: 'none' }}
              />
            </g>
          )
        })}

        {/* Tooltip */}
        {tooltip && (() => {
          const { cx, cy, p } = tooltip
          const ds = getDotStyle(p.flag)
          const label = `${p.numeric_value}${unit ? ` ${unit}` : ''}${p.flag ? ` · ${p.flag}` : ''}`
          const txtW = label.length * 6 + 16
          const tx = Math.min(Math.max(cx - txtW / 2, PAD.left), PAD.left + CHART_W - txtW)
          const ty = cy - 32
          return (
            <g pointerEvents="none">
              <rect x={tx} y={ty} width={txtW} height={20} rx={6} fill={ds.fill} opacity={0.95} />
              <text
                x={tx + txtW / 2}
                y={ty + 13}
                textAnchor="middle"
                fontSize={9.5}
                fill="white"
                fontWeight="600"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {label}
              </text>
            </g>
          )
        })()}
      </svg>

      {/* Ref range legend */}
      {refBand && (
        <p className="mt-1 text-center text-[10px] text-slate-400">
          <span className="inline-block h-2 w-2 rounded-sm bg-emerald-400/40 mr-1 align-middle" />
          Normal range: {refBand.lo}–{refBand.hi}{unit ? ` ${unit}` : ''}
        </p>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LabTrendsChart({ patientId }) {
  const { data, loading, error, testName, fetch } = useLabTrends(patientId)
  const [input, setInput] = useState('')

  function submit(name) {
    if (!name?.trim()) return
    setInput(name)
    fetch(name)
  }

  function handleKey(e) {
    if (e.key === 'Enter') submit(input)
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-card sm:p-6">

      {/* Panel Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-50 pb-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50">
          <TrendingUp className="h-4 w-4 text-amber-600" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700">Lab Trends</p>
          <p className="text-[10px] text-slate-400 truncate">
            {testName ? testName : 'Select a lab test to chart'}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        <FlaskConical className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Enter test name (e.g. HbA1c)…"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
        />
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
        ) : (
          <button
            onClick={() => submit(input)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
            aria-label="Search"
          >
            <Search className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((name) => (
          <button
            key={name}
            onClick={() => submit(name)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              testName === name
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-primary/30 hover:bg-primary/5 hover:text-primary'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-40 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <p className="text-xs text-slate-400">Loading trend data…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div>
            <p>{error}</p>
            <button
              onClick={() => fetch(testName)}
              className="mt-1 text-xs font-semibold text-red-600 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && data && data.total === 0 && (
        <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl bg-slate-50">
          <FlaskConical className="h-6 w-6 text-slate-300" />
          <p className="text-xs text-slate-400">No results for &ldquo;{testName}&rdquo;</p>
        </div>
      )}

      {/* Chart */}
      {!loading && !error && data && data.total > 0 && (
        <div className="space-y-3">
          {/* Summary row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="text-xs font-semibold text-slate-600">
              {data.test_name}
              {data.common_unit && (
                <span className="ml-1 font-normal text-slate-400">({data.common_unit})</span>
              )}
            </p>
            <p className="text-xs text-slate-400">
              {data.total} reading{data.total !== 1 ? 's' : ''}
            </p>
          </div>

          <LabLineChart
            points={data.points}
            unit={data.common_unit}
            refRange={data.points.find((p) => p.reference_range)?.reference_range}
          />

          {/* Data table (last 5 readings) */}
          <div className="mt-1 overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-3 py-2 text-left font-semibold text-slate-400 uppercase tracking-wide text-[10px]">Date</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-400 uppercase tracking-wide text-[10px]">Value</th>
                  <th className="px-3 py-2 text-center font-semibold text-slate-400 uppercase tracking-wide text-[10px]">Flag</th>
                </tr>
              </thead>
              <tbody>
                {data.points.slice(-5).reverse().map((p, i) => {
                  const ds = getDotStyle(p.flag)
                  const flagCls = FLAG_STYLE[p.flag?.toUpperCase()]?.label ?? ''
                  return (
                    <tr key={p.event_id ?? i} className="border-b border-slate-50 last:border-0">
                      <td className="px-3 py-2 text-slate-500">{fullDate(p.event_date)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-700">
                        {p.value_raw}
                        {data.common_unit && (
                          <span className="ml-0.5 font-normal text-slate-400">{data.common_unit}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {p.flag ? (
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${flagCls}`}>
                            {p.flag}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Idle state */}
      {!loading && !error && !data && (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
            <TrendingUp className="h-6 w-6 text-amber-400" />
          </div>
          <p className="text-center text-xs text-slate-400">
            Search a lab test name above<br />to view its trend over time.
          </p>
        </div>
      )}
    </div>
  )
}
