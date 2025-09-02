"use client";

import {makeCassette} from "@/components/gameboy/GameBoyToolWrapper";
import BoxedText from "@/components/ui/text/BoxedText";
import GameBoyCore from "@/components/gameboy/GameBoyCore";


const projects = [
    {
        slug: "smart-plant",
        name: "Smart Plant",
        image: "/portfolio/smart_plant.png",
        pages: [
            { type: "image", src: "/portfolio/smart_plant.png" },
            { type: "image", src: "/portfolio/smart_plant2.png" },
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
        image: "/portfolio/elinker.png",
        pages: [
            { type: "image", src: "/portfolio/elinker.png" },
            { type: "text", content: "Hub NFC per oggetti e card. Provisioning mobile, webhooks e short link." },
            { type: "contacts", contacts: [
                    { label: "Landing", href: "https://evolve3d.it/e-linker" },
                    { label: "Contatti", href: "/contatti" },
                ]},
        ],
    }
];


export default function PortfolioPage() {
    // Una cassetta per founder (multipagina)
    const wrappers = projects.map(makeCassette);

    return (
        <div className="portfolio">

            <BoxedText>
                <h1 className="title">Portfolio</h1>
                Questi sono i progetti che abbiamo realizzato finora. Dagli un'occhiata caricandoli nella console.

            </BoxedText>
            <GameBoyCore
                wrappers={wrappers}
                onEvent={(name, payload) => {
                    if (name === "WRAPPER" && payload?.name === "open") {
                        const href = payload.payload?.href;
                        if (href) window.open(href, "_blank", "noopener,noreferrer");
                    }
                }}
            />
        </div>
    );
}