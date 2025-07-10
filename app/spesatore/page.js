import Spesatore from '@/components/Spesatore'
import configs from './mockup.json'

export const metadata = {
  title: 'Spesatore'
}

export default function SpesatorePage() {
  return (
    <div className="spesatore">
      <h1 className="title">Spesatore</h1>
      <Spesatore configs={configs} />
    </div>
  )
}
