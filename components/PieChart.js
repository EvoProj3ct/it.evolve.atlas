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

const colors = [
  '#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0', '#9966ff',
  '#c9cbcf', '#ff9f40', '#ffcd56', '#4dc9f6', '#b4b4b4', '#f67019'
]

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

  return (
    <div className="pie-wrapper">
      {title && <h2 className="subtitle">{title}</h2>}
      <div className="pie-chart" style={{ background: gradient }} />
    </div>
  )
}
