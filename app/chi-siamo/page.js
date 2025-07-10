import FounderCard from '@/components/FounderCard'

export const metadata = {
  title: 'Chi Siamo'
}

const founders = [
  { name: 'Luca', description: 'Appassionato di tecnologia e nuove sfide.' },
  { name: 'Sara', description: 'Esperta di stampa 3D e design.' },
  { name: 'Marco', description: 'Si occupa di consulenza software.' },
  { name: 'Giulia', description: 'Coordina i progetti con creatività.' }
]

export default function ChiSiamo() {
  return (
    <div className="about">
      <h1 className="title">Chi Siamo</h1>
      <div className="founders">
        {founders.map((f, idx) => (
          <FounderCard key={idx} name={f.name} description={f.description} />
        ))}
      </div>
    </div>
  )
}
