'use client'

import FinanceChart from '@/components/FinanceChart'
import PieChart from '@/components/PieChart'
import records from './mockup.json'
import { useState } from 'react'

export default function EntrateUscitePage() {
  const [summary, setSummary] = useState({ entrate: 0, uscite: 0, totale: 0 })
  return (
    <div className="bilancio">
      <h1 className="title">Entrate/Uscite</h1>
      <FinanceChart records={records} onSummary={setSummary} />
      <p className="totals">
        USCITE: {summary.uscite}€&nbsp; ENTRATE: {summary.entrate}€&nbsp; TOTALE:{' '}
        {summary.totale}€
      </p>
      <div className="pie-charts">
        <PieChart records={records} type="entrata" title="Entrate per mese" />
        <PieChart records={records} type="uscita" title="Uscite per mese" />
      </div>
    </div>
  )
}
