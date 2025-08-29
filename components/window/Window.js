"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { useWindowManager } from "./WindowManager";

/**
 * Componente finestra riutilizzabile.
 * - Mostra title + body
 * - Barra con 3 pulsanti: minimizza (va in tray), ingrandisci (Link), chiudi (nasconde)
 * - La barra si "pinna": dopo primo hover/focus, resta visibile.
 */
export default function Window({
                                   id,
                                   title,
                                   maximizeHref = "/chi-siamo",
                                   children,
                                   pinControlsOnHover = true,
                               }) {
    const { state, register, unregister, minimize, close } = useWindowManager();
    const winState = state.windows[id];

    // "Pin" della window bar: dopo hover/focus resta visibile
    const [barPinned, setBarPinned] = useState(false);

    // Registra la finestra all'avvio, deregistra allo smontaggio
    useEffect(() => {
        register(id, title);
        return () => unregister(id);
    }, [id, title, register, unregister]);

    // Classe per nascondere/mostrare la finestra (gestito via stato)
    const isHidden = !winState?.visible;
    const sectionClass = useMemo(
        () => ["content", "window", isHidden ? "is-hidden" : ""].filter(Boolean).join(" "),
        [isHidden]
    );

    // Pulsanti: minimizza = in tray, chiudi = nascondi senza icona
    const handleMinimize = () => minimize(id);
    const handleClose = () => {
        close(id);
        // Scorri alla sezione successiva (come nel tuo originale)
        const section = document.getElementById(id)?.closest("section");
        const next = section?.nextElementSibling;
        if (next && next.scrollIntoView) {
            next.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Pin dopo hover/focus
    const onBarMouseEnter = () => { if (pinControlsOnHover) setBarPinned(true); };
    const onBarFocusWithin = () => { if (pinControlsOnHover) setBarPinned(true); };

    // ID per associare aria-labelledby
    const titleId = useId();

    return (
        <section id={id} className="home-section" data-window-id={id} aria-labelledby={titleId}>
            <div className={sectionClass} aria-hidden={isHidden ? "true" : "false"}>
                {/* Barra superiore con 3 pulsanti */}
                <div
                    className={`window-bar ${barPinned ? "is-pinned" : ""}`}
                    onMouseEnter={onBarMouseEnter}
                    onFocusCapture={onBarFocusWithin}
                >
                    {/* Minimizza (va in tray) */}
                    <button
                        type="button"
                        className="window-btn minimize"
                        title="Riduci"
                        aria-label="Riduci"
                        onClick={handleMinimize}
                    >
                        <span aria-hidden>–</span>
                    </button>

                    {/* Ingrandisci: nel tuo design è un Link a un'altra pagina */}
                    <Link
                        href={maximizeHref}
                        className="window-btn maximize"
                        title="Ingrandisci"
                        aria-label="Ingrandisci"
                    >
                        <span aria-hidden>⤢</span>
                    </Link>

                    {/* Chiudi: nasconde senza creare icona in tray */}
                    <button
                        type="button"
                        className="window-btn close"
                        title="Chiudi"
                        aria-label="Chiudi"
                        onClick={handleClose}
                    >
                        <span aria-hidden>×</span>
                    </button>
                </div>

                {/* Contenuto */}
                <h2 id={titleId} className="title">{title}</h2>
                <div className="window-body">
                    {children}
                </div>
            </div>
        </section>
    );
}
