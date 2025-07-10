'use client'
import React from 'react'

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

const colors = Array.from({ length: 12 }, (_, i) =>
  `hsl(130, 70%, ${35 + i * 3}%)`
)

export default function PieChart({ records = [], type = 'entrata', title }) {
  const totals = months.map(m =>
    records
      .filter(r => r.mese === m && r.tipo === type)
      .reduce((sum, r) => sum + r.importo, 0)
  )
  const totalSum = totals.reduce((s, v) => s + v, 0)

  let startDeg = 0
  const segments = totals.map((t, i) => {
    const pct = totalSum ? (t / totalSum) * 360 : 0
    const end = startDeg + pct
    const segment = `${colors[i % colors.length]} ${startDeg}deg ${end}deg`
    startDeg = end
    return segment
  })
  const gradient = segments.length
    ? `conic-gradient(${segments.join(',')})`
    : 'none'

  const percents = totals.map(t =>
    totalSum ? Math.round((t / totalSum) * 100) : 0
  )

  return (
    <div className="pie-wrapper">
      {title && <h2 className="subtitle">{title}</h2>}
      <div className="pie-chart" style={{ background: gradient }} />
      <ul className="pie-legend">
        {percents.map((p, i) =>
          p > 0 ? (
            <li key={i}>
              <span
                className="color-box"
                style={{ background: colors[i % colors.length] }}
              />
              {months[i].slice(0, 3)} {p}%
            </li>
          ) : null
        )}
      </ul>
    </div>
  )
}
