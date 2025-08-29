"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Cassette from "./Cassette";

/**
 * Props:
 *  - members: Array<{
 *      slug: string,
 *      name: string,
 *      image?: string,
 *      pages: Array<
 *        | { type: "image", src?: string, caption?: string }
 *        | { type: "text", content: string, kind?: "bio" | "skill" }
 *        | { type: "contacts", contacts: Array<{ label: string, href: string }> }
 *      >
 *    }>
 */
export default function GameBoyConsole({ members = [] }) {
    // Indice della cassetta inserita (null = nessuna)
    const [inserted, setInserted] = useState(null);
    // Indice pagina corrente
    const [pi, setPi] = useState(0);
    // Selettore per la lista contatti
    const [contactIndex, setContactIndex] = useState(0);

    const screenRef = useRef(null);

    const current = inserted == null ? null : members[inserted];
    const pages = current?.pages || [];
    const page = pages[pi];

    // Quando inserisco/espello una cassetta → reset pagina e selettore contatti
    useEffect(() => {
        setPi(0);
        setContactIndex(0);
        screenRef.current?.scrollTo({ top: 0, left: 0 });
    }, [inserted]);

    // Cambio pagina → reset scroll schermo
    useEffect(() => {
        screenRef.current?.scrollTo({ top: 0, left: 0 });
    }, [pi]);

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const nextPage = () => setPi(p => clamp(p + 1, 0, Math.max((pages.length || 1) - 1, 0)));
    const prevPage = () => setPi(p => clamp(p - 1, 0, Math.max((pages.length || 1) - 1, 0)));

    const scrollBy = (dx, dy) => {
        const el = screenRef.current;
        if (!el) return;
        el.scrollBy({ left: dx, top: dy, behavior: "smooth" });
    };

    // A: su contatti apre il link selezionato, altrimenti avanza pagina
    const actionA = () => {
        if (page?.type === "contacts") {
            const c = page.contacts?.[contactIndex];
            if (c?.label && c?.href) window.open(c.href, "_blank", "noopener,noreferrer");
            return;
        }
        nextPage();
    };

    // B: se sono alla prima pagina, espelle la cassetta; altrimenti torna indietro
    const actionB = () => {
        if (inserted != null && pi === 0) {
            setInserted(null);
            return;
        }
        prevPage();
    };

    // Tastiera: frecce + A/B (o Enter/Backspace)
    useEffect(() => {
        const onKey = (e) => {
            const key = e.key.toLowerCase();
            if (key === "arrowright") nextPage();
            if (key === "arrowleft") prevPage();
            if (key === "arrowup") {
                if (page?.type === "contacts") {
                    setContactIndex(i => clamp(i - 1, 0, (page.contacts?.length || 1) - 1));
                } else {
                    scrollBy(0, -90);
                }
            }
            if (key === "arrowdown") {
                if (page?.type === "contacts") {
                    setContactIndex(i => clamp(i + 1, 0, (page.contacts?.length || 1) - 1));
                } else {
                    scrollBy(0, 90);
                }
            }
            if (key === "a" || key === "enter") actionA();
            if (key === "b" || key === "backspace") actionB();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [page, contactIndex, inserted, pi, pages.length]);

    // Etichetta categoria (in alto a sx dentro lo schermo)
    const categoryOf = (p) => {
        if (!p) return "";
        if (p.type === "image") return "Foto";
        if (p.type === "contacts") return "Contatti";
        if (p.type === "text") return p.kind === "skill" ? "Skill" : "Bio";
        return "";
    };

    // Render contenuto dello schermo
    const renderScreen = () => {
        if (inserted == null) {
            return (
                <div className="gb-screen-center">
                    <div className="gb-insert">INSERISCI UNA CASSETTA</div>
                </div>
            );
        }

        // Pagina immagine
        if (page?.type === "image") {
            return (
                <div className="gb-screen-photo">
                    <span className="gb-category">{categoryOf(page)}</span>
                    <Image
                        src={page.src || current.image || "/avatar-placeholder.svg"}
                        alt={current.name}
                        fill
                        sizes="480px"
                    />
                    {/* Nome UNA SOLA VOLTA, in basso a sinistra */}
                    <div className="gb-name">{current.name}</div>

                    {/* Hint solo sulla prima pagina se esistono altre pagine */}
                    {pi === 0 && pages.length > 1 && <div className="gb-hint">▶</div>}

                    {/* Istruzioni contestuali + numero pagina */}
                    <div className="gb-footer-hint">
                        <span>Premi A per andare avanti</span>
                        <span>Premi B per tornare indietro</span>
                    </div>
                    <div className="gb-page-ind">{pi + 1}/{pages.length || 1}</div>
                </div>
            );
        }

        // Pagina contatti
        if (page?.type === "contacts") {
            const list = page.contacts || [];
            return (
                <div className="gb-screen-inner">
                    <span className="gb-category">{categoryOf(page)}</span>
                    <div className="gb-name">{current.name}</div>

                    <ul className="gb-contacts" style={{ marginTop: "1.8rem" }}>
                        {list.map((c, i) => (
                            <li key={i} className={i === contactIndex ? "active" : ""}>
                                {c.label}
                            </li>
                        ))}
                    </ul>

                    <div className="gb-footer-hint">
                        <span>Seleziona con ↑ / ↓</span>
                        <span>Premi A per aprire</span>
                    </div>
                    <div className="gb-page-ind">{pi + 1}/{pages.length || 1}</div>
                </div>
            );
        }

        // Pagine di testo: Bio / Skill
        return (
            <div className="gb-screen-inner">
                <span className="gb-category">{categoryOf(page)}</span>
                <div className="gb-name">{current.name}</div>

                <div className="gb-text" style={{ marginTop: "1.8rem" }}>
                    {(page?.content || "").split("\n").map((l, i) => <div key={i}>{l}</div>)}
                </div>

                <div className="gb-footer-hint">
                    <span>Premi A per andare avanti</span>
                    <span>Premi B per uscire</span>
                </div>
                <div className="gb-page-ind">{pi + 1}/{pages.length || 1}</div>
            </div>
        );
    };

    return (
        <div className="gb-layout">
            {/* Colonna cassette sinistra */}
            <div className="cassette-col">
                {members.slice(0, Math.ceil(members.length / 2)).map((m, idx) => {
                    const index = idx;
                    const isInserted = inserted === index;
                    return (
                        <Cassette
                            key={m.slug}
                            name={m.name}
                            image={m.image}
                            inserted={isInserted}
                            onClick={() => setInserted(isInserted ? null : index)}
                        />
                    );
                })}
            </div>

            {/* Console centrale */}
            <div className="gb-console-vert">
                <div className="gb-screen-vert" ref={screenRef} tabIndex={0}>
                    {renderScreen()}
                </div>

                <div className="gb-controls-vert">
                    {/* A/B a sinistra */}
                    <div className="gb-ab">
                        <button className="gb-btn gb-a" onClick={actionA} aria-label="A">A</button>
                        <button className="gb-btn gb-b" onClick={actionB} aria-label="B">B</button>
                    </div>

                    {/* D-Pad a destra */}
                    <div className="gb-dpad">
                        <button
                            className="gb-btn"
                            onClick={() => (page?.type === "contacts"
                                ? setContactIndex(i => clamp(i - 1, 0, (page.contacts?.length || 1) - 1))
                                : scrollBy(0, -90))}
                            aria-label="Su"
                        >
                            ▲
                        </button>

                        <div className="gb-dpad-row">
                            <button className="gb-btn" onClick={prevPage} aria-label="Sinistra">◀</button>
                            <button
                                className="gb-btn"
                                onClick={() => (page?.type === "contacts"
                                    ? setContactIndex(i => clamp(i + 1, 0, (page.contacts?.length || 1) - 1))
                                    : scrollBy(0, 90))}
                                aria-label="Giù"
                            >
                                ▼
                            </button>
                            <button className="gb-btn" onClick={nextPage} aria-label="Destra">▶</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Colonna cassette destra */}
            <div className="cassette-col">
                {members.slice(Math.ceil(members.length / 2)).map((m, idx) => {
                    const index = idx + Math.ceil(members.length / 2);
                    const isInserted = inserted === index;
                    return (
                        <Cassette
                            key={m.slug}
                            name={m.name}
                            image={m.image}
                            inserted={isInserted}
                            onClick={() => setInserted(isInserted ? null : index)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
