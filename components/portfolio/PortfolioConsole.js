"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Cassette from "@/components/about/Cassette"; // è lo stesso component che usi nel "Chi Siamo"

/**
 * Identico comportamento del GameBoy, ma:
 * - le cassette stanno in un carosello orizzontale sopra la console
 * - puoi scorrere il carosello con le frecce ◀ ▶ oppure trackpad
 * Props:
 *  - projects: [{ slug, name, image, pages:[{type:"image"|"text"|"contacts", ...}] }, ...]
 */
export default function PortfolioConsole({ projects = [] }) {
    const [inserted, setInserted] = useState(null); // index della cassetta inserita
    const [pi, setPi] = useState(0);                // page index
    const [contactIndex, setContactIndex] = useState(0);
    const screenRef = useRef(null);
    const railRef = useRef(null);

    const current = inserted == null ? null : projects[inserted];
    const pages = current?.pages || [];
    const page = pages[pi];

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const nextPage = () => setPi(p => clamp(p + 1, 0, Math.max((pages.length || 1) - 1, 0)));
    const prevPage = () => setPi(p => clamp(p - 1, 0, Math.max((pages.length || 1) - 1, 0)));

    // reset quando inserisci/espelli
    useEffect(() => {
        setPi(0);
        setContactIndex(0);
        screenRef.current?.scrollTo({ top: 0, left: 0 });
    }, [inserted]);

    // reset scroll a ogni pagina
    useEffect(() => {
        screenRef.current?.scrollTo({ top: 0, left: 0 });
    }, [pi]);

    // tastiera (stessa UX del GameBoy)
    useEffect(() => {
        const onKey = (e) => {
            const k = e.key.toLowerCase();
            if (k === "arrowright") nextPage();
            if (k === "arrowleft") prevPage();
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

    // carosello: scroll sinistra/destra
    const scrollRail = (dir = 1) => {
        const rail = railRef.current;
        if (!rail) return;
        const step = rail.clientWidth * 0.8;
        rail.scrollBy({ left: dir * step, behavior: "smooth" });
    };

    // UI schermate (stesso stile del GameBoy)
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
                        sizes="480px"
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
                    <ul className="gb-contacts" style={{ marginTop: "1.8rem" }}>
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
        <div className="portfolio-wrap">
            {/* CAROSELLO */}
            <div className="carousel">
                <button className="carousel-nav left" aria-label="precedenti" onClick={() => scrollRail(-1)}>◀</button>
                <div className="carousel-rail" ref={railRef}>
                    {projects.map((p, idx) => {
                        const isInserted = inserted === idx;
                        return (
                            <div className="carousel-item" key={p.slug}>
                                <Cassette
                                    name={p.name}
                                    image={p.image}
                                    inserted={isInserted}
                                    onClick={() => setInserted(isInserted ? null : idx)}
                                />
                            </div>
                        );
                    })}
                </div>
                <button className="carousel-nav right" aria-label="successivi" onClick={() => scrollRail(1)}>▶</button>
            </div>

            {/* CONSOLE */}
            <div className="gb-console-vert">
                <div className="gb-screen-vert">
                    {renderScreen()}
                </div>

                <div className="gb-controls-vert">
                    <div className="gb-ab">
                        <button className="gb-btn gb-a" onClick={actionA} aria-label="A">A</button>
                        <button className="gb-btn gb-b" onClick={actionB} aria-label="B">B</button>
                    </div>
                    <div className="gb-dpad">
                        <button className="gb-btn" onClick={() => (page?.type === "contacts"
                            ? setContactIndex(i => Math.max(0, i - 1))
                            : screenRef.current?.scrollBy({ top: -90, behavior: "smooth" }))}>▲</button>
                        <div className="gb-dpad-row">
                            <button className="gb-btn" onClick={prevPage}>◀</button>
                            <button className="gb-btn" onClick={() => (page?.type === "contacts"
                                ? setContactIndex(i => Math.min((page.contacts?.length || 1) - 1, i + 1))
                                : screenRef.current?.scrollBy({ top: 90, behavior: "smooth" }))}>▼</button>
                            <button className="gb-btn" onClick={nextPage}>▶</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
