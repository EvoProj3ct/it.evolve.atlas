import GameBoyConsole from "@/components/about/GameBoyConsole";

export const metadata = { title: "Chi Siamo" };

const founders = [
    {
        slug: "emanuele-i",
        name: "Emanuele I.",
        image: "/avatars/emanuele.jpg", // metti i file in /public/avatars, oppure lascia vuoto
        pages: [
            { type: "image", src: "/avatars/emanuele.jpg", caption: "Emanuele I." },
            {
                type: "text",
                content:
                    "Programmatore Full Stack e bonsai guru. Ama far crescere codice e alberi con la stessa pazienza.",
            },
            {
                type: "text",
                content:
                    "Skill:\n- Node/Next\n- IoT\n- Design Systems\n- DevOps",
            },
        ],
    },
    {
        slug: "gianmarco",
        name: "Gianmarco",
        image: "/avatars/gianmarco.jpg",
        pages: [
            { type: "image", src: "/avatars/gianmarco.jpg", caption: "Gianmarco" },
            {
                type: "text",
                content:
                    "Analista ed esploratore di Metaversi. Traduce i dataset in storie leggibili.",
            },
            {
                type: "text",
                content: "Skill:\n- Data viz\n- Unity/VR\n- Product Analytics",
            },
        ],
    },
    {
        slug: "luca-d",
        name: "Luca D.",
        image: "/avatars/luca-d.jpg",
        pages: [
            { type: "image", src: "/avatars/luca-d.jpg", caption: "Luca D." },
            {
                type: "text",
                content:
                    "Progettista 3D e Solution Designer. Converte idee in prototipi stampabili.",
            },
            {
                type: "text",
                content: "Skill:\n- CAD/3D\n- Stampa PLA/NFC\n- Prototipazione rapida",
            },
        ],
    },
    {
        slug: "luca-m",
        name: "Luca M.",
        image: "/avatars/luca-m.jpg",
        pages: [
            { type: "image", src: "/avatars/luca-m.jpg", caption: "Luca M." },
            {
                type: "text",
                content:
                    "Esperto di Blockchain e nuove tecnologie. Tokenizza tutto, tranne il caffè.",
            },
            { type: "text", content: "Skill:\n- Solidity\n- Web3\n- Security" },
        ],
    },
];

export default function ChiSiamo() {
    return (
        <div className="about">
            <h1 className="about-title">Chi Siamo</h1>
            <p className="about-description">
                Evolve nasce nel 2019 con il Covid e la convinzione che il futuro
                dell'informatica e delle nuove tecnologie sarebbe stato radioso.
                Da allora sperimentiamo e innoviamo ogni giorno per offrire soluzioni
                digitali che semplifichino la vita e aprano nuove possibilità.
            </p>

            {/* Game Boy centrale + cassette laterali */}
            <GameBoyConsole members={founders} />
        </div>
    );
}
