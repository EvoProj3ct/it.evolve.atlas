"use client";

import GameBoyCore from "@/components/gameboy/GameBoyCore";
import {createProfileWrapper} from "@/components/gameboy/GameBoyWrappers";
import BoxedText from "@/components/ui/text/BoxedText";


// Dati (come nel tuo page.js originale)
const founders = [
    {
        slug: "emanuele-i",
        name: "Emanuele I.",
        image: "/avatars/emanuele.png",
        pages: [
            {type: "image", src: "/avatars/emanuele.png", caption: "Emanuele I."},
            {
                type: "text",
                content: "Programmatore Full Stack ...essa pazienza. aaaaaaaaaaaaa. aaaaaaaaaaaaaa. aaaaaaaaaaaaa."
            },
            {
                type: "contacts", contacts: [
                    {label: "Email", href: "mailto:emanuele@evolve3d.it"},
                    {label: "LinkedIn", href: "https://www.linkedin.com/"},
                    {label: "GitHub", href: "https://github.com/"},
                ]
            },
        ],
    },
    {
        slug: "gianmarco",
        name: "Gianmarco",
        image: "/avatars/gianmarco.png",
        pages: [
            {type: "image", src: "/avatars/gianmarco.png", caption: "Gianmarco"},
            {type: "text", content: "Analista ed esploratore di Metaversi. Traduce i dataset in storie leggibili."},
            {
                type: "contacts", contacts: [
                    {label: "Email", href: "mailto:gianmarco@evolve3d.it"},
                    {label: "LinkedIn", href: "https://www.linkedin.com/"},
                ]
            },
        ],
    },
    {
        slug: "luca-d",
        name: "Luca D.",
        image: "/avatars/lucad.png",
        pages: [
            {type: "image", src: "/avatars/lucad.png", caption: "Luca D."},
            {type: "text", content: "Progettista 3D e Solution Designer. Converte idee in prototipi stampabili."},
            {
                type: "contacts", contacts: [
                    {label: "Email", href: "mailto:lucad@evolve3d.it"},
                    {label: "Portfolio", href: "https://example.com"},
                ]
            },
        ],
    },
    {
        slug: "luca-m",
        name: "Luca M.",
        image: "/avatars/lucam.png",
        pages: [
            {type: "image", src: "/avatars/lucam.png", caption: "Luca M."},
            {type: "text", content: "Esperto di Blockchain e nuove tecnologie. Tokenizza tutto, tranne il caffè."},
            {
                type: "contacts", contacts: [
                    {label: "Email", href: "mailto:lucam@evolve3d.it"},
                    {label: "LinkedIn", href: "https://www.linkedin.com/"},
                    {label: "X", href: "https://x.com/"},
                ]
            },
        ],
    },
];

// TODO refactor
export default function AboutPage() {
    // Una cassetta per founder (multipagina)
    const wrappers = founders.map(createProfileWrapper);

    return (
        <div className="about">

            <BoxedText>
                <h1 className="title">Chi Siamo</h1>
                Evolve nasce nel 2019 con il Covid e la convinzione che il futuro
                dell'informatica e delle nuove tecnologie sarebbe stato radioso. Da allora
                sperimentiamo e innoviamo ogni giorno per offrire soluzioni digitali che
                semplifichino la vita e aprano nuove possibilità.
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
