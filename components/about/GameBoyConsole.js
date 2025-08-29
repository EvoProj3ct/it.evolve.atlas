"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Cassette from "./Cassette";

/**
 * Props attese:
 * members: [
 *   {
 *     slug: string,
 *     name: string,
 *     image?: string,
 *     pages: [
 *       { type: "image", src?: string },              // foto
 *       { type: "text", content: string, kind?: "bio" | "skill" },
 *       { type: "contacts", contacts: [{ label, href }] }
 *     ]
 *   }, ...
 * ]
 */
export default function GameBoyConsole({ members = [] }) {
    // indice della cassetta inserita (null = nessuna)
    const [inserted, setInserted] = useState(null);
    // indice pagina corrente
    const [pi, setPi] = useState(0);
    // indice contatto selezionato per la pagina Contatti
    const [contactIndex, setContactIndex] = useState(0);

    const screenRef = useRef(null);

    const current = inserted == null ? null : members[inserted];
    const pages = current?.pages || [];
    const page = pages[pi];

    /* -----------------------------
       Helpers
    ------------------------------*/
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const nextPage = () => setPi(p => clamp(p + 1, 0, Math.max((pages.length || 1) - 1, 0)));
    const prevPage = () => setPi(p => clamp(p - 1, 0, Math.max((pages.length || 1) - 1, 0)));

    const scrollBy = (dx, dy) => {
        const el = screenRef.current;
        if (!el) return;
        el.scrollBy({ left: dx, top: dy, behavior: "smooth" });
    };

    /* -----------------------------
       Effetti
    ------------------------------*/
    // Inserimento/espulsione: reset pagina/contatti/scroll
    useEffect(() => {
        setPi(0);
        setContactIndex(0);
        screenRef.current?.scrollTo({ top: 0, left: 0 });
    }, [inserted]);

    // Cambio pagina: reset scroll
    useEffect(() => {
        screenRef.current?.scrollTo({ top: 0, left: 0 });
    }, [pi]);

    // Tastiera (freccette + A/B | Enter/Backspace)
    useEffect(() => {
        const onKey = (e) => {
            const k = e.key.toLowerCase();
            if (k === "arrowright") nextPage();
            if (k === "arrowleft") prevPage();
            if (k === "arrowup") {
                if (page?.type === "contacts") {
                    setContactIndex(i => clamp(i - 1, 0, (page.contacts?.length || 1) - 1));
                } else {
                    scrollBy(0, -90);
                }
            }
            if (k === "arrowdown") {
                if (page?.type === "contacts") {
                    setContactIndex(i => clamp(i + 1, 0, (page.contacts?.length || 1) - 1));
                } else {
                    scrollBy(0, 90);
                }
            }
            if (k === "a" || k === "enter") actionA();
            if (k === "b" || k === "backspace") actionB();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [page, contactIndex, inserted, pi, pages.length]);

    /* -----------------------------
       Azioni tasti A / B
    ------------------------------*/
    // A: se contatti → apri link; altrimenti avanti pagina
    const actionA = () => {
        if (page?.type === "contacts") {
            const c = page.contacts?.[contactIndex];
            if (c?.href) window.open(c.href, "_blank", "noopener,noreferrer");
            return;
        }
        nextPage();
    };

    // B: alla prima pagina espelle cassetta, altrimenti indietro pagina
    const actionB = () => {
        if (inserted != null && pi === 0) {
            setInserted(null);
        } else {
            prevPage();
        }
    };

    /* -----------------------------
       Render contenuto schermo
    ------------------------------*/
    const renderScreen = () => {
        // Stato senza cassetta
        if (inserted == null) {
            return (
                <div className="gb-screen-center">
                    <div className="gb-insert">INSERISCI UNA CASSETTA</div>
                </div>
            );
        }

        // Foto
        if (page?.type === "image") {
            return (
                <div className="gb-screen-photo">
                    <Image
                        src={page.src || current.image || "/avatar-placeholder.svg"}
                        alt={current.name}
                        fill
                        sizes="480px"
                    />
                    {/* Nome UNA SOLA VOLTA: in basso a sinistra */}
                    <div className="gb-name">{current.name}</div>

                    {/* Spacer per non sovrapporre la barra hint */}
                    <div className="gb-bottom-safe" />

                    {/* Istruzioni contestuali e indice pagina */}
                    <div className="gb-footer-hint">
                        <span>Premi A per andare avanti</span>
                        <span>Premi B per uscire</span>
                    </div>
                    <div className="gb-page-ind">{pi + 1}/{pages.length || 1}</div>
                </div>
            );
        }

        // Contatti
        if (page?.type === "contacts") {
            const list = page.contacts || [];
            return (
                <div className="gb-screen-inner">
                    <div className="gb-name">{current.name}</div>

                    <ul className="gb-contacts" style={{ marginTop: "1.8rem" }}>
                        {list.map((c, i) => (
                            <li key={i} className={i === contactIndex ? "active" : ""}>
                                {c.label}
                            </li>
                        ))}
                    </ul>

                    <div className="gb-bottom-safe" />
                    <div className="gb-footer-hint">
                        <span>Seleziona con ↑ / ↓</span>
                        <span>Premi A per aprire</span>
                    </div>
                    <div className="gb-page-ind">{pi + 1}/{pages.length || 1}</div>
                </div>
            );
        }

        // Testo (Bio / Skill)
        return (
            <div className="gb-screen-inner">
                <div className="gb-name">{current.name}</div>

                <div className="gb-text" style={{ marginTop: "1.8rem" }}>
                    {(page?.content || "")
                        .split("\n")
                        .map((l, i) => <div key={i}>{l}</div>)}
                </div>

                <div className="gb-bottom-safe" />
                <div className="gb-footer-hint">
                    <span>Premi A per andare avanti</span>
                    <span>Premi B per uscire</span>
                </div>
                <div className="gb-page-ind">{pi + 1}/{pages.length || 1}</div>
            </div>
        );
    };

    /* -----------------------------
       Layout completo
    ------------------------------*/
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
                            onClick={() =>
                                (page?.type === "contacts"
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
                                onClick={() =>
                                    (page?.type === "contacts"
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
