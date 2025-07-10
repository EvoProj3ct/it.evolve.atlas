'use client'
import { useState } from 'react'

export default function InventoryViewer({ items = [] }) {
  const [filter, setFilter] = useState('Tutti')

  const filtered = filter === 'Tutti' ? items : items.filter(i => i.tipo === filter)

  return (
    <div className="inventory-viewer">
      <select value={filter} onChange={e => setFilter(e.target.value)} className="inventory-filter">
        <option value="Tutti">Tutti</option>
        <option value="Materiale">Materiale</option>
        <option value="Integrazione">Integrazione</option>
        <option value="Decorazione">Decorazione</option>
      </select>
      <div className="inventory-list">
        {filtered.map((item, idx) => (
          <div key={idx} className="inventory-item">
            <h4 className="inventory-name">{item.tipologia}</h4>
            <p className="inventory-type">Tipo: {item.tipo}</p>
            <p className="inventory-qty">
              Quantità: {item.quantita} {item.misura}
            </p>
            <p className="inventory-tag">Uso: {item.segnalatore}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
