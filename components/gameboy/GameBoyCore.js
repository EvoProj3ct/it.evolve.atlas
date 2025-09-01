"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Cassette from "./Cassette";
import { GBInput } from "./GameBoyWrappers"; // il Core non conosce più i tipi, solo gli input
import styles from "./GameBoyStyles.module.css";

/**
 * GameBoyCore — versione aggiornata
 * - Il wrapper multipagina contiene logica & render (current.render()).
 * - Il Core inoltra input e monta il risultato.
 * - Supporta className extra (es. "shell-compact" | "shell-slim") e style (custom properties) per ridurre la scocca.
 */
export default function GameBoyCore({
                                        wrappers: wrappersProp = [],
                                        initialInserted = null,
                                        onInsertChange,
                                        onEvent,
                                        className = "",
                                        style, // ← custom properties per shell (opzionale)
                                    }) {
    const wrappers = useMemo(() => {
        const arr = Array.isArray(wrappersProp) ? wrappersProp : [wrappersProp];
        return arr.filter(Boolean);
    }, [wrappersProp]);

    const [inserted, setInserted] = useState(() => {
        if (initialInserted != null) return initialInserted;
        return null;
    });

    const current = inserted == null ? null : wrappers[inserted] || null;
    const [, setTick] = useState(0); // re-render trigger
    const trackRef = useRef(null);

    // Sottoscrizione aggiornamenti dal wrapper corrente
    useEffect(() => {
        if (!current || typeof current.subscribe !== "function") return;
        const unsub = current.subscribe(() => setTick(t => t + 1));

        // Relay eventi wrapper → host
        const relays = [];
        const relay = (name) => {
            const off = current.on?.(name, (payload) => {
                if (typeof onEvent === "function") onEvent("WRAPPER", { name, payload });
            });
            if (off) relays.push(off);
        };
        ["open", "openImage", "seek", "back", "notify"].forEach(relay);

        return () => { unsub && unsub(); relays.forEach(off => off && off()); };
    }, [current, onEvent]);

    // Gestione input
    const send = useCallback((name, payload) => {
        if (typeof onEvent === "function") onEvent(name, payload);
        current?.handleInput?.(name, payload);
    }, [current, onEvent]);

    // Keyboard mapping (migliorata: Enter=START, Backspace=SELECT + ignore typing)
    useEffect(() => {
        const isTyping = (el) => {
            if (!el) return false;
            const tag = el.tagName;
            return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
        };

        const onKey = (e) => {
            if (isTyping(document.activeElement)) return;
            const key = e.key; // usa la chiave nativa per chiarezza
            let input = null;
            switch (key) {
                case "ArrowUp":    input = GBInput.UP; break;
                case "ArrowDown":  input = GBInput.DOWN; break;
                case "ArrowLeft":  input = GBInput.LEFT; break;
                case "ArrowRight": input = GBInput.RIGHT; break;
                case "a":
                case "A":          input = GBInput.A; break;
                case "b":
                case "B":          input = GBInput.B; break;
                case "Enter":      input = GBInput.START; break;     // START
                case "Backspace":  input = GBInput.SELECT; break;    // SELECT
                default: return; // tasto non gestito
            }
            e.preventDefault();
            send(input);
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [send]);

    const toggleInsert = useCallback((index) => {
        setInserted(prev => {
            const next = prev === index ? null : index;
            onInsertChange && onInsertChange(next);
            return next;
        });
    }, [onInsertChange]);

    const rendered = current?.render?.();

    return (
        <div className={`${styles.root} gameboy ${className || ""}`} style={style} role="region" aria-label="GameBoy">
            {/* Carosello cassette */}
            <div className="gb-carousel" role="region" aria-label="Selettore cassette">
                <button
                    type="button"
                    className="gb-carousel__nav gb-carousel__nav--prev"
                    aria-label="Indietro"
                    onClick={() => trackRef.current?.scrollBy({ left: -240, behavior: "smooth" })}
                >‹</button>
                <div className="gb-carousel__viewport">
                    <div className="gb-carousel__track" ref={trackRef}>
                        {wrappers.map((w, i) => (
                            <Cassette
                                key={i}
                                name={w?.label || "Cassette"}
                                image={w?.image || "/avatar-placeholder.svg"}
                                inserted={inserted === i}
                                onClick={() => toggleInsert(i)}
                            />
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    className="gb-carousel__nav gb-carousel__nav--next"
                    aria-label="Avanti"
                    onClick={() => trackRef.current?.scrollBy({ left: 240, behavior: "smooth" })}
                >›</button>
            </div>

            <div className="gb-body">
                <div className="gb-screen">
                    <div className="gb-screen__inner">
                        {rendered || <div className="gb-screen__empty">Inserisci una cassetta</div>}
                    </div>
                </div>

                <div data-gb="controls-row">
                    <div data-gb="dpad" className="gb-dpad" aria-label="Direzionale">
                        <button className="gb-dpad__up" aria-label="Su" onClick={() => send(GBInput.UP)} />
                        <button className="gb-dpad__left" aria-label="Sinistra" onClick={() => send(GBInput.LEFT)} />
                        <button className="gb-dpad__right" aria-label="Destra" onClick={() => send(GBInput.RIGHT)} />
                        <button className="gb-dpad__down" aria-label="Giù" onClick={() => send(GBInput.DOWN)} />
                    </div>
                    <div data-gb="ab" className="gb-ab" aria-label="Pulsanti A e B">
                        <button className="gb-btn gb-btn--a" aria-label="A" onClick={() => send(GBInput.A)}>A</button>
                        <button className="gb-btn gb-btn--b" aria-label="B" onClick={() => send(GBInput.B)}>B</button>
                    </div>
                </div>

                <div className="gb-ss">
                    <button className="gb-ss__btn" aria-label="Select" onClick={() => send(GBInput.SELECT)}>Select</button>
                    <button className="gb-ss__btn" aria-label="Start"  onClick={() => send(GBInput.START)}>Start</button>
                </div>
            </div>
        </div>
    );
}
