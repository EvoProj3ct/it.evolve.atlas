"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import Cassette from "@/components/about/Cassette"; // riuso

const VISIBLE_COUNT = 2;       // 2 cassette visibili
const CLONES = 3;             // quanti blocchi concatenati: [P][P][P]
const AUTOSCROLL_MS = 2600;   // tempo fra uno step e l'altro
const STEP_MULTIPLIER = 1;    // quante cassette per step (1 oppure 2 se vuoi saltare a coppie)

export default function PortfolioConsole({ projects = [] }) {
    // --- dati loopati: [P][P][P]
    const extended = useMemo(() => {
        if (!projects?.length) return [];
        const blocks = Array.from({ length: CLONES }, () => projects);
        return blocks.flat();
    }, [projects]);

    const realLen = projects?.length || 0;
    const baseOffset = realLen; // partiamo dal blocco centrale

    // --- console state
    const [inserted, setInserted] = useState(null); // index reale (0..realLen-1)
    const [pi, setPi] = useState(0);
    const [contactIndex, setContactIndex] = useState(0);

    // --- carosello state
    const [focusIndex, setFocusIndex] = useState(baseOffset); // indice sull'extended
    const viewportRef = useRef(null);
    const railRef = useRef(null);
    const itemRefs = useRef([]);

    // misure per scorrere a scatti
    const [itemH, setItemH] = useState(0);
    const [gapPx, setGapPx] = useState(0);

    // autoscroll timer
    const timerRef = useRef(null);
    const pausedRef = useRef(false);

    // comodità
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const currentReal = inserted == null ? null : projects[inserted];
    const pages = currentReal?.pages || [];
    const page = pages[pi];

    const nextPage = () => setPi(p => clamp(p + 1, 0, (pages.length || 1) - 1));
    const prevPage = () => setPi(p => clamp(p - 1, 0, (pages.length || 1) - 1));

    // ===== Console: reset pagina/contatti quando inserisci/espelli
    useEffect(() => { setPi(0); setContactIndex(0); }, [inserted]);
    useEffect(() => {
        document.querySelector(".portfolio-screen .gb-screen-inner")?.scrollTo({ top: 0 });
    }, [pi]);

    // ===== Tastiera per console
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

    // ===== Misure & posizione iniziale (centro blocchi)
    useEffect(() => {
        const measure = () => {
            const first = itemRefs.current[0];
            const rail = railRef.current;
            const vp = viewportRef.current;
            if (!first || !rail || !vp) return;

            const h = first.getBoundingClientRect().height;
            const styles = getComputedStyle(rail);
            const gap = parseFloat(styles.rowGap || "0");

            setItemH(h);
            setGapPx(gap);

            // Fisso l'altezza del viewport per mostrare esattamente 2 cassette
            const vpH = VISIBLE_COUNT * h + (VISIBLE_COUNT - 1) * gap;
            vp.style.height = `${vpH}px`;

            // Posiziono il centro (blocchi [P][*P*][P]) allineando l'item focus
            const top = (focusIndex) * (h + gap);
            vp.scrollTo({ top, behavior: "instant" });
        };
        // misuro dopo mount e su resize
        const rAF = requestAnimationFrame(measure);
        const ro = new ResizeObserver(measure);
        if (railRef.current) ro.observe(railRef.current);
        window.addEventListener("resize", measure);
        return () => { cancelAnimationFrame(rAF); ro.disconnect(); window.removeEventListener("resize", measure); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [extended.length]); // ricalcolo se cambiano i dati

    // ===== Helpers carosello a scatti
    const scrollToIndex = (idx, smooth = true) => {
        const vp = viewportRef.current;
        if (!vp) return;
        const top = idx * (itemH + gapPx);
        vp.scrollTo({ top, behavior: smooth ? "smooth" : "instant" });
    };

    const setFocusAndScroll = (idx, smooth = true) => {
        setFocusIndex(idx);
        scrollToIndex(idx, smooth);
    };

    const focusPrev = (mult = 1) => {
        pausedRef.current = true; // stop autoscroll durante interazione
        const step = mult * STEP_MULTIPLIER;
        let next = focusIndex - step;
        // se scendo sotto il blocco sinistro, rimbalzo nel blocco centrale
        if (next < realLen) next += realLen;
        setFocusAndScroll(next);
    };

    const focusNext = (mult = 1) => {
        pausedRef.current = true;
        const step = mult * STEP_MULTIPLIER;
        let next = focusIndex + step;
        // se supero il blocco destro, retrocedo di realLen per rimanere nel centrale
        if (next >= realLen * 2) next -= realLen;
        setFocusAndScroll(next);
    };

    const handleCassetteClick = (idxExtended, isInserted) => {
        pausedRef.current = true;
        const realIdx = idxExtended % realLen;
        setInserted(isInserted ? null : realIdx);
    };

    // ===== Autoscroll lento + loop infinito
    useEffect(() => {
        if (!realLen || !itemH) return;

        const tick = () => {
            if (pausedRef.current) return; // pausa su hover/interazione
            // avanza di 1 step (o 2 se vuoi)
            let next = focusIndex + STEP_MULTIPLIER;
            if (next >= realLen * 2) next -= realLen; // rimango nel blocco centrale
            setFocusAndScroll(next);
        };

        timerRef.current = setInterval(tick, AUTOSCROLL_MS);
        return () => clearInterval(timerRef.current);
    }, [focusIndex, realLen, itemH, gapPx]);

    // Pausa autoscroll quando il mouse è sopra il carosello o la console
    useEffect(() => {
        const pause = () => (pausedRef.current = true);
        const resume = () => (pausedRef.current = false);
        const nodes = [viewportRef.current, document.querySelector(".portfolio-console")];
        nodes.forEach((n) => {
            if (!n) return;
            n.addEventListener("mouseenter", pause);
            n.addEventListener("mouseleave", resume);
        });
        return () => {
            nodes.forEach((n) => {
                if (!n) return;
                n.removeEventListener("mouseenter", pause);
                n.removeEventListener("mouseleave", resume);
            });
        };
    }, []);

    // ===== Schermo console (420x260, margini extra)
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
                        src={page.src || currentReal.image || "/avatar-placeholder.svg"}
                        alt={currentReal.name}
                        fill
                        sizes="420px"
                    />
                    <div className="gb-name">{currentReal.name}</div>
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
                    <div className="gb-name">{currentReal.name}</div>
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
                <div className="gb-name">{currentReal.name}</div>
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
            {/* Carosello verticale */}
            <div className="v-carousel">
                <button
                    className="v-nav v-nav-big up"
                    aria-label="precedenti"
                    onClick={() => focusPrev(1)}
                    onDoubleClick={() => focusPrev(2)}
                    title="Su (dblclick = salta 2)"
                >
                    ▲
                </button>

                <div className="v-viewport" ref={viewportRef}>
                    <div className="v-rail" ref={railRef}>
                        {extended.map((p, idx) => {
                            const realIdx = realLen ? idx % realLen : 0;
                            const isInserted = inserted === realIdx;
                            return (
                                <div
                                    className={`v-item ${focusIndex === idx ? "focus" : ""}`}
                                    key={`${p.slug}-${idx}`}
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

                <button
                    className="v-nav v-nav-big down"
                    aria-label="successivi"
                    onClick={() => focusNext(1)}
                    onDoubleClick={() => focusNext(2)}
                    title="Giù (dblclick = salta 2)"
                >
                    ▼
                </button>
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
                                    : document.querySelector(".portfolio-screen .gb-screen-inner")?.scrollBy({ top: -90, behavior: "smooth" }))
                            }
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
                                        : document.querySelector(".portfolio-screen .gb-screen-inner")?.scrollBy({ top: 90, behavior: "smooth" }))
                                }
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
