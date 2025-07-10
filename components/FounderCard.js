'use client'
import Image from 'next/image'

const placeholder = '/avatar-placeholder.svg'

export default function FounderCard({ name, image = placeholder, description }) {
  const imgSrc = image || placeholder
  return (
    <div className="founder-card">
      <div className="founder-inner">
        <div className="founder-face founder-front">
          <Image src={imgSrc} alt={name} fill />
          <span className="founder-name">{name}</span>
        </div>
        <div className="founder-face founder-back">
          <p>{description}</p>
        </div>
      </div>
    </div>
  )
}
