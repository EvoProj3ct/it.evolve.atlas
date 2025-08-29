"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import GameBoyPanel from "./ui/GameBoyPanel";

const placeholder = "/avatar-placeholder.svg";

export default function FounderCard({ name, slug, image = placeholder, description, skills = [], contact }) {
    const [open, setOpen] = useState(false);

    // Pagine nello schermo: Foto → Bio → Skill → Link scheda completa
    const pages = useMemo(() => {
        const listSkills = skills.length ? `Skill:\n- ${skills.join("\n- ")}` : null;
        return [
            { type: "image", src: image || placeholder, alt: name },
            { type: "text",  content: description },
            ...(listSkills ? [{ type: "text", content: listSkills }] : []),
            { type: "link",  href: `/chi-siamo/${slug}`, label: "Apri scheda completa →" },
        ];
    }, [image, name, description, skills, slug]);

    return (
        <div className={`founder-card ${open ? "is-open" : ""}`}>
            <button
                type="button"
                className="founder-hit"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={`gb-${name}`}
                title={open ? "Chiudi dettagli" : "Apri dettagli"}
            >
                <div className="founder-front">
                    <div className="founder-img-wrap">
                        <Image src={image || placeholder} alt={name} fill sizes="(max-width: 700px) 100vw, 33vw" />
                    </div>
                    <span className="founder-name">{name}</span>
                </div>
            </button>

            {open && (
                <GameBoyPanel id={`gb-${name}`} onClose={() => setOpen(false)} pages={pages} />
            )}
        </div>
    );
}
