import FinanceChart from '@/components/FinanceChart'
import records from './mockup.json'

export const metadata = {
  title: 'Entrate e Uscite',
}

export default function EntrateUscitePage() {
  return (
    <div className="bilancio">
      <h1 className="title">Entrate/Uscite</h1>
      <FinanceChart records={records} />
    </div>
  )
}
