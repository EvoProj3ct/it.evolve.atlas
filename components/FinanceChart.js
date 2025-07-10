'use client'
import { useState } from 'react'

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

export default function FinanceChart({ records = [] }) {
  const [monthIdx, setMonthIdx] = useState(0)
  const currentMonth = months[monthIdx]
  const filtered = records.filter(r => r.mese === currentMonth)
  const max = Math.max(...filtered.map(r => r.importo), 1)

  return (
    <div className="finance-chart">
      <div
        className="filter-slider"
        style={{ '--slider-pct': `${(monthIdx / (months.length - 1)) * 100}%` }}
      >
        <input
          type="range"
          min="0"
          max={months.length - 1}
          step="1"
          value={monthIdx}
          onChange={e => setMonthIdx(Number(e.target.value))}
        />
        <div className="labels">
          {months.map(m => (
            <span key={m}>{m.slice(0, 3)}</span>
          ))}
        </div>
      </div>

      <div className="chart">
        {filtered.map((rec, idx) => {
          const height = `${(rec.importo / max) * 100}%`
          const barClass = rec.tipo === 'entrata' ? 'income' : 'expense'
          return (
            <div key={idx} className={`bar ${barClass}`}>
              <div className="bar-inner" style={{ '--h': height }} />
              <small className="bar-label">{rec.descrizione}</small>
            </div>
          )
        })}
      </div>
    </div>
  )
}
