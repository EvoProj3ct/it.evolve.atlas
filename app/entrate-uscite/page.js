import FinanceChart from '@/components/FinanceChart'
import PieChart from '@/components/PieChart'
import records from './mockup.json'

export const metadata = {
  title: 'Entrate e Uscite',
}

export default function EntrateUscitePage() {
  return (
    <div className="bilancio">
      <h1 className="title">Entrate/Uscite</h1>
      <FinanceChart records={records} />
      <div className="pie-charts">
        <PieChart records={records} type="entrata" title="Entrate per mese" />
        <PieChart records={records} type="uscita" title="Uscite per mese" />
      </div>
    </div>
  )
}
