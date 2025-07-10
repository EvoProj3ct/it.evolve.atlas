'use client'
import { useState, useEffect } from 'react'

const months = [
  'Tutti',
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

export default function FinanceChart({ records = [], onSummary }) {
  const [monthIdx, setMonthIdx] = useState(0)
  const [hoverIdx, setHoverIdx] = useState(null)
  const currentMonth = months[monthIdx]
  const filtered =
    currentMonth === 'Tutti'
      ? [...records]
      : records.filter(r => r.mese === currentMonth)
  filtered.sort((a, b) => new Date(a.data) - new Date(b.data))
  const max = Math.max(...filtered.map(r => r.importo), 1)

  const totalEntrate = filtered
    .filter(r => r.tipo === 'entrata')
    .reduce((s, r) => s + r.importo, 0)
  const totalUscite = filtered
    .filter(r => r.tipo === 'uscita')
    .reduce((s, r) => s + r.importo, 0)

  useEffect(() => {
    onSummary?.({
      month: currentMonth,
      entrate: totalEntrate,
      uscite: totalUscite,
      totale: totalEntrate - totalUscite,
    })
  }, [monthIdx, records])

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
          const isHover = hoverIdx === idx
          return (
            <div
              key={idx}
              className={`bar ${barClass}`}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <div className="bar-inner" style={{ '--h': height }} />
              <span className="bar-label">{rec.importo}€</span>
              {isHover && (
                <span className="bar-tooltip">
                  {rec.descrizione}
                  <br />
                  {rec.importo}€
                  <br />
                  {rec.data}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
