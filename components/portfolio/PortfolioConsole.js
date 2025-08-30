"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Cassette from "@/components/about/Cassette"; // riuso

const VISIBLE_COUNT = 2; // Mostra al massimo 2 cassette visibili

export default function PortfolioConsole({ projects = [] }) {
    // Console state
    const [inserted, setInserted] = useState(null); // index cassetta inserita
    const [pi, setPi] = useState(0);                // page index
    const [contactIndex, setContactIndex] = useState(0);

    // Carosello state
    const [focusIndex, setFocusIndex] = useState(0);
    const viewportRef = useRef(null);   // contenitore scrollabile
    const railRef = useRef(null);       // griglia interna
    const itemRefs = useRef([]);        // refs alle cassette

    // Misure per scorrere “a scatti”
    const [itemH, setItemH] = useState(0);
    const [gapPx, setGapPx] = useState(0);
    const [viewportH, setViewportH] = useState(0);

    const current = inserted == null ? null : projects[inserted];
    const pages = current?.pages || [];
    const page  = pages[pi];

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const nextPage = () => setPi(p => clamp(p + 1, 0, (pages.length || 1) - 1));
    const prevPage = () => setPi(p => clamp(p - 1, 0, (pages.length || 1) - 1));

    // --- console: reset quando inserisci/espelli/pagina cambia
    useEffect(() => { setPi(0); setContactIndex(0); }, [inserted]);
    useEffect(() => { // reset scroll del contenuto
        document.querySelector(".portfolio-screen .gb-screen-inner")?.scrollTo({ top: 0 });
    }, [pi]);

    // --- tastiera per console
    useEffect(() => {
        const onKey = (e) => {
            const k = e.key.toLowerCase();
            if (k === "arrowright") nextPage();
            if (k === "arrowleft")  prevPage();
            if (k === "arrowup") {
                if (page?.type === "contacts") {
                    setContactIndex(i => clamp(i - 1, 0, (page.contacts?.length || 1) - 1));
                } else {
                    document.querySelector(".portfolio-screen .gb-screen-inner")?.scrollBy({ top: -90, behavior: "smooth" });
                }
            }
            if (k === "arrowdown") {
                if (page?.type === "contacts") {
                    setContactIndex(i => clamp(i + 1, 0, (page.contacts?.length || 1) - 1));
                } else {
                    document.querySelector(".portfolio-screen .gb-screen-inner")?.scrollBy({ top: 90, behavior: "smooth" });
                }
            }
            if (k === "a" || k === "enter") actionA();
            if (k === "b" || k === "backspace") actionB();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [page, contactIndex, pages.length]);

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

    // --- misurazione altezza item e gap per viewport = 2 cassette
    useEffect(() => {
        const measure = () => {
            const first = itemRefs.current[0];
            const rail  = railRef.current;
            const vp    = viewportRef.current;
            if (!first || !rail || !vp) return;

            const h = first.getBoundingClientRect().height;
            const styles = getComputedStyle(rail);
            const gap = parseFloat(styles.rowGap || "0");
            setItemH(h);
            setGapPx(gap);

            const vpH = VISIBLE_COUNT * h + (VISIBLE_COUNT - 1) * gap;
            setViewportH(vpH);
            vp.style.height = `${vpH}px`; // fissa viewport: max 2 in vista
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(railRef.current);
        window.addEventListener("resize", measure);
        return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
    }, [projects.length]);

    // --- carosello: focus + scorrimento a scatti
    const scrollByItems = (deltaItems) => {
        if (!viewportRef.current) return;
        const step = deltaItems * (itemH + gapPx);
        viewportRef.current.scrollBy({ top: step, behavior: "smooth" });
    };
    const focusPrev = () => {
        const next = (focusIndex - 1 + projects.length) % projects.length;
        setFocusIndex(next);
        scrollByItems(-1);
    };
    const focusNext = () => {
        const next = (focusIndex + 1) % projects.length;
        setFocusIndex(next);
        scrollByItems(+1);
    };

    const handleCassetteClick = (idx, isInserted) => {
        setInserted(isInserted ? null : idx);
    };

    // --- rendering schermo console (420x260, margini extra)
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
                <div className="gb-screen-inner">
                    <div className="gb-name">{current.name}</div>
                    <ul className="gb-contacts" style={{ marginTop: "1.2rem" }}>
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
            <div className="gb-screen-inner">
                <div className="gb-name">{current.name}</div>
                <div className="gb-text" style={{ marginTop: "1.2rem" }}>
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
            {/* Carosello verticale (max 2 visibili) */}
            <div className="v-carousel">
                <button className="v-nav v-nav-big up" aria-label="precedenti" onClick={focusPrev}>▲</button>

                <div className="v-viewport" ref={viewportRef} /* height fissata da JS */>
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
                </div>

                <button className="v-nav v-nav-big down" aria-label="successivi" onClick={focusNext}>▼</button>
            </div>

            {/* Console a lato */}
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
                                    : document.querySelector(".portfolio-screen .gb-screen-inner")?.scrollBy({ top: -90, behavior: "smooth" }))}
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
                                        : document.querySelector(".portfolio-screen .gb-screen-inner")?.scrollBy({ top: 90, behavior: "smooth" }))}
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
