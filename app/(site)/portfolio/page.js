// "use client" NON serve: la page è server, i component dentro sono client.
import PortfolioConsole from "@/components/portfolio/PortfolioConsole";

export const metadata = { title: "Portfolio" };

// Esempio dati: quante cassette vuoi, ogni cassetta = progetto
const projects = [
    {
        slug: "smart-plant",
        name: "Smart Plant",
        image: "/portfolio/smart-plant.jpg",
        pages: [
            { type: "image", src: "/portfolio/smart-plant.png" },
            { type: "text", kind: "bio", content: "Monitoraggio IoT per bonsai. Sensori BLE, gateway MQTT, dashboard Next.js." },
            { type: "text", kind: "skill", content: "Stack: ESP32 • BLE • MQTT • Next.js • Tailwind • MongoDB" },
            { type: "contacts", contacts: [
                    { label: "Demo Live", href: "https://example.com/demo" },
                    { label: "Repo Git", href: "https://github.com/you/smart-plant" },
                ]},
        ],
    },
    {
        slug: "e-linker",
        name: "E-Linker",
        image: "/portfolio/e-linker.jpg",
        pages: [
            { type: "image", src: "/portfolio/e-linker.jpg" },
            { type: "text", content: "Hub NFC per oggetti fisici e card. Provisioning da mobile, webhooks e short links." },
            { type: "contacts", contacts: [
                    { label: "Landing", href: "https://evolve3d.it/e-linker" },
                    { label: "Contattaci", href: "/contatti" },
                ]},
        ],
    },
    {
        slug: "voice-bot",
        name: "E-Talk",
        image: "/portfolio/e-talk.jpg",
        pages: [
            { type: "image", src: "/portfolio/e-talk.jpg" },
            { type: "text", content: "Assistente vocale per PMI. Prompt tools, memorie e interfacce telefoniche." },
            { type: "text", kind: "skill", content: "Stack: Next.js • Edge Functions • WebRTC • RAG • VAD" },
            { type: "contacts", contacts: [
                    { label: "Case study", href: "https://example.com/case-etalk" },
                ]},
        ],
    },
];

export default function PortfolioPage() {
    return (
        <section className="portfolio">
            <h1 className="title">Portfolio</h1>
            <p className="description">
                Seleziona una cassetta dal carosello e naviga le schermate con A/B e il D-Pad.
            </p>
            <PortfolioConsole projects={projects} />
        </section>
    );
}
