"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useWindows } from "./WindowManager";

export default function WindowFrame({ id, title, maximizeHref = "/chi-siamo", children }) {
    const { state, register, pin, minimize, close, restore } = useWindows();
    const w = state.byId[id] || { pinned: false, minimized: false, closed: false };

    // timer per auto-restore e flag per animazione fade-in
    const reopenTimerRef = useRef(null);
    const [reopening, setReopening] = useState(false);

    useEffect(() => { register(id, title); }, [id, title, register]);
    useEffect(() => () => { if (reopenTimerRef.current) clearTimeout(reopenTimerRef.current); }, []);

    const isHidden = w.minimized || w.closed;
    const contentClass =
        "content" +
        (isHidden ? " is-hidden" : "") +
        (w.pinned ? " keep-bar" : "") +
        (reopening ? " fade-in" : "");

    const onClose = () => {
        close(id);
        // riapertura automatica dopo 20 secondi con fade-in
        if (reopenTimerRef.current) clearTimeout(reopenTimerRef.current);
        reopenTimerRef.current = setTimeout(() => {
            setReopening(true);
            restore(id);
            setTimeout(() => setReopening(false), 1000); // durata animazione
        }, 20000);

        // scroll alla sezione successiva (comportamento precedente)
        const section = document.getElementById(id)?.closest("section");
        const next = section?.nextElementSibling;
        next?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const onMinimize = () => { minimize(id); };
    const onFirstHoverOrFocus = () => { if (!w.pinned) pin(id); };

    return (
        <section id={id} className="home-section" aria-labelledby={`${id}-title`}>
            <div
                className={contentClass}
                data-window-id={id}
                aria-hidden={isHidden ? "true" : "false"}
                onMouseEnter={onFirstHoverOrFocus}
                onFocusCapture={onFirstHoverOrFocus}
            >
                <div className="window-bar">
                    <button
                        type="button"
                        className="window-btn minimize"
                        title="Riduci"
                        aria-label="Riduci"
                        onClick={onMinimize}
                    />
                    <Link
                        href={maximizeHref}
                        className="window-btn maximize"
                        title="Ingrandisci"
                        aria-label="Ingrandisci"
                    />
                    <button
                        type="button"
                        className="window-btn close"
                        title="Chiudi"
                        aria-label="Chiudi"
                        onClick={onClose}
                    />
                </div>

                <h2 id={`${id}-title`} className="title">{title}</h2>
                <div className="window-body">{children}</div>
            </div>
        </section>
    );
}
