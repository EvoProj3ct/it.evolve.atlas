import InventoryViewer from '@/components/InventoryViewer'
import items from './mockup.json'

export const metadata = {
  title: 'Magazzino'
}

export default function MagazzinoPage() {
  return (
    <div className="magazzino">
      <h1 className="title">Magazzino</h1>
      <InventoryViewer items={items} />
    </div>
  )
}
