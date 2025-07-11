'use client'
import React, { useState } from 'react'

const months = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
]

const colors = ['var(--color-primary)', 'var(--color-white)']

export default function PieChart({ records = [], type = 'entrata', title }) {
  const [hoverIdx, setHoverIdx] = useState(null)

  const totals = months.map(m =>
    records
      .filter(r => r.mese === m && r.tipo === type)
      .reduce((sum, r) => sum + r.importo, 0)
  )
  const totalSum = totals.reduce((s, v) => s + v, 0)

  let startDeg = 0
  const segments = totals.map((t, i) => {
    const pct = totalSum ? t / totalSum : 0
    const end = startDeg + pct * 360
    const mid = startDeg + (pct * 360) / 2
    startDeg = end
    return {
      start: startDeg - pct * 360,
      end,
      mid,
      color: colors[i % colors.length],
      percent: Math.round(pct * 100),
      label: months[i].slice(0, 3),
    }
  })

  const describeArc = (x, y, r, startAngle, endAngle) => {
    const start = polar(x, y, r, endAngle)
    const end = polar(x, y, r, startAngle)
    const large = endAngle - startAngle > 180 ? 1 : 0
    return `M ${x} ${y} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`
  }

  const polar = (cx, cy, r, deg) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  return (
    <div className="pie-wrapper">
      {title && <h2 className="subtitle">{title}</h2>}
      <div className="pie-label">
        {hoverIdx !== null &&
          `${segments[hoverIdx].label} ${segments[hoverIdx].percent}%`}
      </div>
      <svg viewBox="0 0 100 100" className="pie-chart">
        {segments.map((seg, i) => (
          seg.percent > 0 && (
            <path
              key={i}
              d={describeArc(50, 50, 50, seg.start, seg.end)}
              fill={seg.color}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
          )
        ))}
      </svg>
    </div>
  )
}
