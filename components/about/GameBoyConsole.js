"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Cassette from "./Cassette";

export default function GameBoyConsole({ members = [] }) {
    // indice membro inserito (null = nessuna cassetta)
    const [inserted, setInserted] = useState(null);
    // pagina corrente
    const [pi, setPi] = useState(0);
    // selezione contatti
    const [contactIndex, setContactIndex] = useState(0);

    const screenRef = useRef(null);
    const current = inserted == null ? null : members[inserted];
    const pages = current?.pages || [];
    const page = pages[pi];

    // quando inserisco/espello cassetta resetto stato
    useEffect(() => {
        setPi(0);
        setContactIndex(0);
        screenRef.current?.scrollTo({ top: 0, left: 0 });
    }, [inserted]);

    // reset scroll a cambio pagina
    useEffect(() => {
        screenRef.current?.scrollTo({ top: 0, left: 0 });
    }, [pi]);

    const nextPage = () => setPi((p) => Math.min(p + 1, (pages.length || 1) - 1));
    const prevPage = () => setPi((p) => Math.max(p - 1, 0));

    const scrollBy = (dx, dy) => {
        if (!screenRef.current) return;
        screenRef.current.scrollBy({ left: dx, top: dy, behavior: "smooth" });
    };

    // Azione A: se pagina contatti → apri link selezionato, altrimenti next
    const actionA = () => {
        if (page?.type === "contacts") {
            const c = page.contacts?.[contactIndex];
            if (c?.href) window.open(c.href, "_blank", "noopener,noreferrer");
        } else {
            nextPage();
        }
    };

    // Azione B: espelli se cassetta inserita, altrimenti prev page
    const actionB = () => {
        if (inserted != null && pi === 0) {
            setInserted(null); // eject
        } else {
            prevPage();
        }
    };

    // tastiera
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight") nextPage();
            if (e.key === "ArrowLeft") prevPage();
            if (e.key === "ArrowUp") {
                if (page?.type === "contacts")
                    setContactIndex((i) => Math.max(i - 1, 0));
                else scrollBy(0, -90);
            }
            if (e.key === "ArrowDown") {
                if (page?.type === "contacts")
                    setContactIndex((i) => Math.min(i + 1, (page.contacts?.length || 1) - 1));
                else scrollBy(0, 90);
            }
            if (e.key.toLowerCase() === "a" || e.key === "Enter") actionA();
            if (e.key.toLowerCase() === "b" || e.key === "Backspace") actionB();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [pi, inserted, page, contactIndex]);

    // Render schermo
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
                        alt={page.caption || current.name}
                        fill
                        sizes="480px"
                    />
                    <div className="gb-screen-name">{page.caption || current.name}</div>
                    {pi === 0 && pages.length > 1 && <div className="gb-hint">▶</div>}
                </div>
            );
        }
        if (page?.type === "contacts") {
            const list = page.contacts || [];
            return (
                <div className="gb-screen-inner">
                    <div className="gb-screen-name">{current.name}</div>
                    <ul className="gb-contacts">
                        {list.map((c, i) => (
                            <li key={i} className={i === contactIndex ? "active" : ""}>
                                {c.label}
                            </li>
                        ))}
                    </ul>
                    <div className="gb-cta">Premi A per inviare</div>
                </div>
            );
        }
        // type = text
        return (
            <div className="gb-screen-inner">
                <div className="gb-screen-name">{current.name}</div>
                <div className="gb-text">{(page?.content || "").split("\n").map((l, i) => <div key={i}>{l}</div>)}</div>
            </div>
        );
    };

    return (
        <div className="gb-layout">
            {/* Cassette: sinistra */}
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

            {/* Console centrale (dimensione fissa, verticale) */}
            <div className="gb-console-vert">
                <div className="gb-screen-vert" ref={screenRef} tabIndex={0}>
                    {renderScreen()}
                    {inserted != null && (
                        <div className="gb-page-ind">{pi + 1}/{pages.length || 1}</div>
                    )}
                </div>

                <div className="gb-controls-vert">
                    {/* A/B a sinistra */}
                    <div className="gb-ab">
                        <button className="gb-btn gb-a" onClick={actionA} aria-label="A">A</button>
                        <button className="gb-btn gb-b" onClick={actionB} aria-label="B">B</button>
                    </div>
                    {/* D-pad a destra */}
                    <div className="gb-dpad">
                        <button className="gb-btn" onClick={() => page?.type === "contacts" ? setContactIndex((i)=>Math.max(i-1,0)) : scrollBy(0,-90)} aria-label="Su">▲</button>
                        <div className="gb-dpad-row">
                            <button className="gb-btn" onClick={prevPage} aria-label="Sinistra">◀</button>
                            <button className="gb-btn" onClick={() => page?.type === "contacts" ? setContactIndex((i)=>Math.min(i+1,(page.contacts?.length||1)-1)) : scrollBy(0,90)} aria-label="Giù">▼</button>
                            <button className="gb-btn" onClick={nextPage} aria-label="Destra">▶</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cassette: destra */}
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
