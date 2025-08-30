"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Cassette from "@/components/about/Cassette"; // lo stesso che usi in "Chi Siamo"

/**
 * Carosello VERTICALE a lato del Game Boy.
 * - Frecce ↑ ↓ per scorrere la lista
 * - Click su cassetta = inserisci/espelli
 * - Console: 420x260, stesso rendering di GameBoyConsole
 */
export default function PortfolioConsole({ projects = [] }) {
    const [inserted, setInserted] = useState(null);   // index della cassetta inserita
    const [pi, setPi] = useState(0);                  // page index
    const [contactIndex, setContactIndex] = useState(0);
    const screenRef = useRef(null);
    const railRef   = useRef(null);
    const itemRefs  = useRef([]);

    const current = inserted == null ? null : projects[inserted];
    const pages = current?.pages || [];
    const page  = pages[pi];

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const nextPage = () => setPi(p => clamp(p + 1, 0, Math.max((pages.length || 1) - 1, 0)));
    const prevPage = () => setPi(p => clamp(p - 1, 0, Math.max((pages.length || 1) - 1, 0)));

    // Reset quando inserisci/espelli
    useEffect(() => {
        setPi(0);
        setContactIndex(0);
        screenRef.current?.scrollTo({ top: 0, left: 0 });
    }, [inserted]);

    // Reset scroll a ogni pagina
    useEffect(() => {
        screenRef.current?.scrollTo({ top: 0, left: 0 });
    }, [pi]);

    // Tastiera (come GameBoy)
    useEffect(() => {
        const onKey = (e) => {
            const k = e.key.toLowerCase();
            if (k === "arrowright") nextPage();
            if (k === "arrowleft")  prevPage();
            if (k === "arrowup") {
                if (page?.type === "contacts") {
                    setContactIndex(i => clamp(i - 1, 0, (page.contacts?.length || 1) - 1));
                } else {
                    screenRef.current?.scrollBy({ top: -90, behavior: "smooth" });
                }
            }
            if (k === "arrowdown") {
                if (page?.type === "contacts") {
                    setContactIndex(i => clamp(i + 1, 0, (page.contacts?.length || 1) - 1));
                } else {
                    screenRef.current?.scrollBy({ top: 90, behavior: "smooth" });
                }
            }
            if (k === "a" || k === "enter") actionA();
            if (k === "b" || k === "backspace") actionB();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [page, contactIndex, inserted, pi, pages.length]);

    const actionA = () => {
        if (page?.type === "contacts") {
            const c = page.contacts?.[contactIndex];
            if (c?.href) window.open(c.href, "_blank", "noopener,noreferrer");
            return;
        }
        nextPage();
    };
    const actionB = () => {
        if (inserted != null && pi === 0) setInserted(null);
        else prevPage();
    };

    // Carosello verticale: focus su item corrente
    const [focusIndex, setFocusIndex] = useState(0);
    const scrollToIndex = (idx) => {
        const el = itemRefs.current[idx];
        if (!el || !railRef.current) return;
        el.scrollIntoView({ block: "center", behavior: "smooth" });
    };
    const focusPrev = () => {
        const next = (focusIndex - 1 + projects.length) % projects.length;
        setFocusIndex(next);
        scrollToIndex(next);
    };
    const focusNext = () => {
        const next = (focusIndex + 1) % projects.length;
        setFocusIndex(next);
        scrollToIndex(next);
    };

    // Quando confermi il focus cliccando, inserisci quella cassetta
    const handleCassetteClick = (idx, isInserted) => {
        setInserted(isInserted ? null : idx);
    };

    // Render schermate console (uguale al GameBoy “Chi Siamo” ma 420x260)
    const renderScreen = () => {
        if (inserted == null) {
            return (
                <div className="gb-screen-center">
                    <div className="gb-insert">INSERISCI UNA CASSETTA</div>
                </div>
            );
        }
        if (page?.type === "image") {
            return (
                <div className="gb-screen-photo">
                    <Image
                        src={page.src || current.image || "/avatar-placeholder.svg"}
                        alt={current.name}
                        fill
                        sizes="420px"
                    />
                    <div className="gb-name">{current.name}</div>
                    <div className="gb-footer-hint">
                        <span>Premi A per andare avanti</span>
                        <span>Premi B per uscire</span>
                    </div>
                    <div className="gb-page-ind">{pi + 1}/{pages.length || 1}</div>
                </div>
            );
        }
        if (page?.type === "contacts") {
            const list = page.contacts || [];
            return (
                <div className="gb-screen-inner" ref={screenRef}>
                    <div className="gb-name">{current.name}</div>
                    <ul className="gb-contacts" style={{ marginTop: "1.4rem" }}>
                        {list.map((c, i) => (
                            <li key={i} className={i === contactIndex ? "active" : ""}>{c.label}</li>
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
        // text
        return (
            <div className="gb-screen-inner" ref={screenRef}>
                <div className="gb-name">{current.name}</div>
                <div className="gb-text" style={{ marginTop: "1.4rem" }}>
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
        <div className="portfolio-side-layout">
            {/* Carosello verticale a sinistra */}
            <div className="v-carousel">
                <button className="v-nav up" aria-label="precedenti" onClick={focusPrev}>▲</button>

                <div className="v-rail" ref={railRef}>
                    {projects.map((p, idx) => {
                        const isInserted = inserted === idx;
                        return (
                            <div
                                className={`v-item ${focusIndex === idx ? "focus" : ""}`}
                                key={p.slug}
                                ref={(el) => (itemRefs.current[idx] = el)}
                                onMouseEnter={() => setFocusIndex(idx)}
                            >
                                <Cassette
                                    name={p.name}
                                    image={p.image}
                                    inserted={isInserted}
                                    onClick={() => handleCassetteClick(idx, isInserted)}
                                />
                            </div>
                        );
                    })}
                </div>

                <button className="v-nav down" aria-label="successivi" onClick={focusNext}>▼</button>
            </div>

            {/* Console */}
            <div className="gb-console-vert portfolio-console">
                <div className="gb-screen-vert portfolio-screen">
                    {renderScreen()}
                </div>

                <div className="gb-controls-vert">
                    <div className="gb-ab">
                        <button className="gb-btn gb-a" onClick={actionA} aria-label="A">A</button>
                        <button className="gb-btn gb-b" onClick={actionB} aria-label="B">B</button>
                    </div>
                    <div className="gb-dpad">
                        <button
                            className="gb-btn"
                            onClick={() =>
                                (page?.type === "contacts"
                                    ? setContactIndex(i => clamp(i - 1, 0, (page.contacts?.length || 1) - 1))
                                    : screenRef.current?.scrollBy({ top: -90, behavior: "smooth" }))}
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
                                        : screenRef.current?.scrollBy({ top: 90, behavior: "smooth" }))}
                                aria-label="Giù"
                            >
                                ▼
                            </button>
                            <button className="gb-btn" onClick={nextPage} aria-label="Destra">▶</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
