'use client'

import OverviewClient from './OverviewClient'
import Spesatore from '@/components/Spesatore'
import FinanceChart from '@/components/FinanceChart'
import PieChart from '@/components/PieChart'
import configs from './mockup.json'
import { useState } from 'react'

export const metadata = {
  title: 'Overview',
}

export default function OverviewPage() {
  return <OverviewClient />

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

function buildRecords(items) {
  const year = new Date().getFullYear()
  const records = []
  items.forEach(it => {
    const base = {
      tipo: it.type === 'income' ? 'entrata' : 'uscita',
      descrizione: it.description,
    }
    if (it.frequency === 'once') {
      const mIdx = new Date().getMonth()
      const date = `${year}-${String(mIdx + 1).padStart(2, '0')}-01`
      records.push({ ...base, importo: it.amount, data: date, mese: months[mIdx] })
    } else {
      months.forEach((m, idx) => {
        const amount = it.frequency === 'weekly' ? it.amount * 4 : it.amount
        const date = `${year}-${String(idx + 1).padStart(2, '0')}-01`
        records.push({ ...base, importo: amount, data: date, mese: m })
      })
    }
  })
  return records
}

export default function OverviewPage() {
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState({ entrate: 0, uscite: 0, totale: 0 })
  const records = buildRecords(items)

  return (
    <div className="overview">
      <h1 className="title">Overview</h1>
      <Spesatore configs={configs} onItemsChange={setItems} />
      <FinanceChart records={records} onSummary={setSummary} />
      <p className="totals">
        USCITE: {summary.uscite}€&nbsp; ENTRATE: {summary.entrate}€&nbsp; TOTALE: {summary.totale}€
      </p>
      <div className="pie-charts">
        <PieChart records={records} type="entrata" title="Entrate per mese" />
        <PieChart records={records} type="uscita" title="Uscite per mese" />
      </div>
    </div>
  )
}