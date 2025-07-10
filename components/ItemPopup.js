'use client'

export default function ItemPopup({ item, onClose }) {
  if (!item) return null

  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          &#x2715;
        </button>
        <h3>{item.tipologia}</h3>
        <p>Tipo: {item.tipo}</p>
        <p>Quantità: {item.quantita} {item.misura}</p>
        <p>Uso: {item.segnalatore}</p>
      </div>
    </div>
  )
}
