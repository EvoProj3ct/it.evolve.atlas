import FounderCard from "@/components/FounderCard";

export const metadata = { title: "Chi Siamo" };

const founders = [
    {
        slug: "emanuele-i",
        name: "Emanuele I.",
        image: "/avatars/emanuele.jpg", // metti in /public/avatars
        description: "Programmatore Full Stack e bonsai guru. Ama far crescere codice e alberi con la stessa pazienza.",
        skills: ["Node/Next", "IoT", "Design Systems", "DevOps"],
        contact: { email: "emanuele@evolve3d.it" },
    },
    {
        slug: "gianmarco",
        name: "Gianmarco",
        image: "/avatars/gianmarco.jpg",
        description: "Analista ed esploratore di Metaversi. Traduce i dataset in storie leggibili.",
        skills: ["Data viz", "Unity/VR", "Product Analytics"],
        contact: { email: "gianmarco@evolve3d.it" },
    },
    {
        slug: "luca-d",
        name: "Luca D.",
        image: "/avatars/luca-d.jpg",
        description: "Progettista 3D e Solution Designer. Converte idee in prototipi stampabili.",
        skills: ["CAD/3D", "Stampa PLA/NFC", "Prototipazione rapida"],
        contact: { email: "lucad@evolve3d.it" },
    },
    {
        slug: "luca-m",
        name: "Luca M.",
        image: "/avatars/luca-m.jpg",
        description: "Esperto di Blockchain e nuove tecnologie. Tokenizza tutto, tranne il caffè.",
        skills: ["Solidity", "Web3", "Sicurezza"],
        contact: { email: "lucam@evolve3d.it" },
    },
];

export default function ChiSiamo() {
    return (
        <div className="about">
            <h1 className="title">Chi Siamo</h1>
            <p className="description">
                Evolve nasce nel 2019 con il Covid e la convinzione che il futuro
                dell'informatica e delle nuove tecnologie sarebbe stato radioso.
                Da allora sperimentiamo e innoviamo ogni giorno per offrire soluzioni
                digitali che semplifichino la vita e aprano nuove possibilità.
            </p>

            <div className="founders-grid">
                {founders.map((f) => (
                    <FounderCard key={f.slug} {...f} />
                ))}
            </div>
        </div>
    );
}
