'use client'
import { useState, useEffect } from 'react'

export default function Spesatore({ configs: initial, onItemsChange }) {
  const [configs, setConfigs] = useState(initial)
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('spesatoreConfigs')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setConfigs(parsed)
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('spesatoreConfigs', JSON.stringify(configs))
  }, [configs])

  const current = configs[currentIdx] || { items: [] }

  useEffect(() => {
    onItemsChange?.(current.items)
  }, [configs, currentIdx, onItemsChange])

  const addConfig = () => {
    setConfigs([...configs, { name: 'Nuova', items: [] }])
    setCurrentIdx(configs.length)
  }

  const renameConfig = name => {
    const copy = [...configs]
    copy[currentIdx].name = name
    setConfigs(copy)
  }

  const addItem = () => {
    const copy = [...configs]
    copy[currentIdx].items.push({
      type: 'expense',
      description: '',
      amount: 0,
      frequency: 'once',
    })
    setConfigs(copy)
  }

  const updateItem = (idx, field, value) => {
    const copy = [...configs]
    copy[currentIdx].items[idx][field] = value
    setConfigs(copy)
  }

  const total = current.items.reduce((sum, it) => {
    const mult = it.frequency === 'monthly' ? 12 : it.frequency === 'weekly' ? 52 : 1
    const sign = it.type === 'income' ? 1 : -1
    return sum + it.amount * mult * sign
  }, 0)

  return (
    <div className="spesatore-tool">
      <div className="config-select">
        <select value={currentIdx} onChange={e => setCurrentIdx(Number(e.target.value))}>
          {configs.map((c, i) => (
            <option key={i} value={i}>{c.name}</option>
          ))}
        </select>
        <button onClick={addConfig} className="btn">Nuova Configurazione</button>
      </div>
      <div className="config-name">
        <input value={current.name} onChange={e => renameConfig(e.target.value)} />
      </div>
      <table className="items">
        <thead>
          <tr>
            <th>Tipo</th><th>Descrizione</th><th>Frequenza</th><th>Importo</th>
          </tr>
        </thead>
        <tbody>
          {current.items.map((it, idx) => (
            <tr key={idx}>
              <td>
                <select value={it.type} onChange={e => updateItem(idx, 'type', e.target.value)}>
                  <option value="income">Entrata</option>
                  <option value="expense">Uscita</option>
                </select>
              </td>
              <td>
                <input value={it.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
              </td>
              <td>
                <select value={it.frequency} onChange={e => updateItem(idx, 'frequency', e.target.value)}>
                  <option value="once">Una Tantum</option>
                  <option value="monthly">Mensile</option>
                  <option value="weekly">Settimanale</option>
                </select>
              </td>
              <td>
                <input type="number" value={it.amount} onChange={e => updateItem(idx, 'amount', Number(e.target.value))} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addItem} className="btn add-item">+ Aggiungi Voce</button>
      <div className="summary">Previsione annuale: {total}€</div>
    </div>
  )
}
