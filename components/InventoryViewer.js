'use client'
import { useState, useRef } from 'react'
import ItemPopup from './ItemPopup'

const categories = ['Tutti', 'Materiale', 'Integrazione', 'Decorazione']

export default function InventoryViewer({ items = [] }) {
  const [filterIdx, setFilterIdx] = useState(0)
  const [order, setOrder] = useState(items)
  const [active, setActive] = useState(null)
  const dragIndex = useRef(null)

  const currentFilter = categories[filterIdx]
  const filtered =
    currentFilter === 'Tutti'
      ? order
      : order.filter(i => i.tipo === currentFilter)

  const handleRange = e => setFilterIdx(Number(e.target.value))

  const handleDragStart = idx => () => {
    dragIndex.current = idx
  }

  const handleDrop = idx => e => {
    e.preventDefault()
    const copy = [...order]
    const [moved] = copy.splice(dragIndex.current, 1)
    copy.splice(idx, 0, moved)
    setOrder(copy)
  }

  const handleDragOver = e => e.preventDefault()

  return (
    <div className="inventory-viewer">
      <div
        className="filter-slider"
        style={{ '--slider-pct': `${(filterIdx / (categories.length - 1)) * 100}%` }}
      >
        <input
          type="range"
          min="0"
          max={categories.length - 1}
          step="1"
          value={filterIdx}
          onChange={handleRange}
        />
        <div className="labels">
          {categories.map(cat => (
            <span key={cat}>{cat}</span>
          ))}
        </div>
      </div>

      <div className="inventory-list">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="inventory-item"
            draggable
            onDragStart={handleDragStart(idx)}
            onDragOver={handleDragOver}
            onDrop={handleDrop(idx)}
            onClick={() => setActive(item)}
          >
            <strong>{item.tipologia}</strong>
            <small>
              {item.quantita} {item.misura}
            </small>
          </div>
        ))}
      </div>

      <ItemPopup item={active} onClose={() => setActive(null)} />
    </div>
  )
}
