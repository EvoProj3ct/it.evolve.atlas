import FounderCard from '@/components/FounderCard'

export const metadata = {
  title: 'Chi Siamo'
}

const founders = [
  { name: 'Emanuele I.', description: 'Programmatore Full Stack e bonsai guru' },
  { name: 'Gianmarco', description: 'Analista ed esperto di Metaversi' },
  { name: 'Luca D.', description: 'Progettista 3D e Solution Designer' },
  { name: 'Luca M.', description: 'Esperto di Blockchain e nuove tecnologie' },
]

export default function ChiSiamo() {
  return (
    <div className="about">
      <h1 className="title">Chi Siamo</h1>
      <p className="description">
        Evolve nasce nel 2019 con il Covid e la convinzione che il futuro
        dell'informatica e delle nuove tecnologie sarebbe stato radioso. Da
        allora sperimentiamo e innoviamo ogni giorno per offrire soluzioni
        digitali che semplifichino la vita e aprano nuove possibilità.
      </p>
      <div className="founders">
        {founders.map((f, idx) => (
          <FounderCard key={idx} name={f.name} description={f.description} />
        ))}
      </div>
    </div>
  )
}
