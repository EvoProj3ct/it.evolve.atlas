"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Cassette from "./Cassette";

export default function GameBoyConsole({ members = [] }) {
    // membro selezionato (indice) e pagina selezionata
    const [mi, setMi] = useState(0);
    const [pi, setPi] = useState(0);
    const screenRef = useRef(null);

    const current = members[mi] || { name: "", pages: [] };
    const pages = current.pages || [];
    const page = pages[pi];

    // quando cambio membro, torno alla prima pagina (foto)
    useEffect(() => setPi(0), [mi]);

    // reset scroll quando cambio pagina
    useEffect(() => {
        screenRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pi]);

    const nextPage = () => setPi((p) => Math.min(p + 1, pages.length - 1));
    const prevPage = () => setPi((p) => Math.max(p - 1, 0));
    const scrollBy = (dx, dy) => {
        const el = screenRef.current;
        if (!el) return;
        el.scrollBy({ left: dx, top: dy, behavior: "smooth" });
    };

    // tastiera: frecce + A(Enter/KeyA) / B(Backspace/KeyB)
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight") nextPage();
            if (e.key === "ArrowLeft") prevPage();
            if (e.key === "ArrowUp") scrollBy(0, -90);
            if (e.key === "ArrowDown") scrollBy(0, 90);
            if (e.key === "Enter" || e.key === "a" || e.key === "A") nextPage();
            if (e.key === "Backspace" || e.key === "b" || e.key === "B") prevPage();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [pages.length]);

    // righe a capo per lo schermo LCD
    const renderText = (txt) =>
        txt.split("\n").map((line, i) => <div key={i}>{line}</div>);

    return (
        <div className="gb-layout">
            {/* Colonna sinistra cassette */}
            <div className="cassette-col left">
                {members.slice(0, Math.ceil(members.length / 2)).map((m, idx) => {
                    const index = idx; // reale a sinistra
                    return (
                        <Cassette
                            key={m.slug}
                            name={m.name}
                            image={m.image}
                            active={mi === index}
                            onClick={() => setMi(index)}
                        />
                    );
                })}
            </div>

            {/* Console centrale */}
            <div className="gb-console">
                {/* SCHERMO (unico) — mostra tutto qui: img, nome, descrizione, ecc. */}
                <div className="gb-screen" ref={screenRef} tabIndex={0}>
                    {page?.type === "image" ? (
                        <div className="gb-photo">
                            <Image
                                src={page.src || "/avatar-placeholder.svg"}
                                alt={page.caption || current.name}
                                fill
                                sizes="480px"
                            />
                            {/* Nome dentro lo schermo, in alto */}
                            <div className="gb-caption">{page.caption || current.name}</div>
                            {/* hint per “vai avanti” se esiste pagina successiva */}
                            {pi === 0 && pages.length > 1 && <div className="gb-hint">▶</div>}
                        </div>
                    ) : (
                        <div className="gb-screen-inner">
                            {/* Mostro sempre il nome in alto anche nelle pagine testuali */}
                            <div className="gb-name">{current.name}</div>
                            <div className="gb-text">{renderText(page?.content || "")}</div>
                        </div>
                    )}
                    {/* indicatore pagina */}
                    <div className="gb-page-indicator">
                        {Math.min(pi + 1, pages.length)}/{pages.length || 1}
                    </div>
                </div>

                {/* PLANCIA COMANDI — sempre visibile, al centro, D-Pad + A/B */}
                <div className="gb-controls">
                    <div className="gb-dpad">
                        <button className="gb-btn" onClick={() => scrollBy(0, -90)} aria-label="Su">▲</button>
                        <div className="gb-dpad-row">
                            <button className="gb-btn" onClick={prevPage} aria-label="Pagina precedente">◀</button>
                            <button className="gb-btn" onClick={() => scrollBy(0, 90)} aria-label="Giù">▼</button>
                            <button className="gb-btn" onClick={nextPage} aria-label="Pagina successiva">▶</button>
                        </div>
                    </div>

                    <div className="gb-ab">
                        <button className="gb-btn gb-a" onClick={nextPage} aria-label="A">A</button>
                        <button className="gb-btn gb-b" onClick={prevPage} aria-label="B">B</button>
                    </div>
                </div>
            </div>

            {/* Colonna destra cassette */}
            <div className="cassette-col right">
                {members.slice(Math.ceil(members.length / 2)).map((m, idx) => {
                    const index = idx + Math.ceil(members.length / 2);
                    return (
                        <Cassette
                            key={m.slug}
                            name={m.name}
                            image={m.image}
                            active={mi === index}
                            onClick={() => setMi(index)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
