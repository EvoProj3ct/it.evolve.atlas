// server component
import PortfolioConsole from "@/components/portfolio/PortfolioConsole";

export const metadata = { title: "Portfolio" };

// Aggiungi quante cassette vuoi
const projects = [
    {
        slug: "smart-plant",
        name: "Smart Plant",
        image: "/portfolio/smart-plant.jpg",
        pages: [
            { type: "image", src: "/portfolio/smart-plant.jpg" },
            { type: "text", kind: "bio", content: "IoT per bonsai: sensori ESP32, gateway MQTT, dashboard Next.js." },
            { type: "contacts", contacts: [
                    { label: "Demo Live", href: "https://example.com/demo" },
                    { label: "GitHub", href: "https://github.com/you/smart-plant" },
                ]},
        ],
    },
    {
        slug: "e-linker",
        name: "E-Linker",
        image: "/portfolio/e-linker.jpg",
        pages: [
            { type: "image", src: "/portfolio/e-linker.jpg" },
            { type: "text", content: "Hub NFC per oggetti e card. Provisioning mobile, webhooks e short link." },
            { type: "contacts", contacts: [
                    { label: "Landing", href: "https://evolve3d.it/e-linker" },
                    { label: "Contatti", href: "/contatti" },
                ]},
        ],
    },
    {
        slug: "e-talk",
        name: "E-Talk",
        image: "/portfolio/e-talk.jpg",
        pages: [
            { type: "image", src: "/portfolio/e-talk.jpg" },
            { type: "text", content: "Assistente vocale per PMI con IVR, prompt tools e memorie." },
            { type: "text", kind: "skill", content: "Stack: Next.js • Edge • WebRTC • RAG • VAD" },
            { type: "contacts", contacts: [
                    { label: "Case Study", href: "https://example.com/case-etalk" },
                ]},
        ],
    },
    {
        slug: "e-spesatore",
        name: "E-Spesatore",
        image: "/portfolio/e-spesatore.jpg",
        pages: [
            { type: "image", src: "/portfolio/e-spesatore.jpg" },
            { type: "text", content: "Gestione spese con OCR e categorizzazione automatica." },
            { type: "contacts", contacts: [
                    { label: "Repo", href: "https://github.com/you/e-spesatore" },
                ]},
        ],
    },
    {
        slug: "e-magazzino",
        name: "E-Magazzino",
        image: "/portfolio/e-magazzino.jpg",
        pages: [
            { type: "image", src: "/portfolio/e-magazzino.jpg" },
            { type: "text", content: "Inventario con QR/NFC, prenotazioni e tracciamento prestiti." },
            { type: "contacts", contacts: [
                    { label: "Demo", href: "https://example.com/e-magazzino" },
                ]},
        ],
    },
    {
        slug: "e-finanze",
        name: "E-Finanze",
        image: "/portfolio/e-finanze.jpg",
        pages: [
            { type: "image", src: "/portfolio/e-finanze.jpg" },
            { type: "text", content: "Planner finanziario con KPI, PDF export e connettori bancari." },
            { type: "contacts", contacts: [
                    { label: "Landing", href: "https://example.com/e-finanze" },
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
