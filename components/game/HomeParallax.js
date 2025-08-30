"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./GameStyles.module.css";
import ParallaxAliens from "./ParallaxAliens";

/**
 * Monta un contenitore nel <body> con className={styles.portalRoot}
 * e ci “porta” dentro i layer del gioco. Il portal ha z-index:-1,
 * quindi tutto il gioco è sotto al resto della pagina.
 * Il bottone toggle resta FUORI dal portal, così è visibile e cliccabile.
 */
export default function HomeParallax() {
    const [portalEl, setPortalEl] = useState(null);
    const [mode, setMode] = useState("ALIEN"); // "ALIEN" | "GHOST"

    useEffect(() => {
        const el = document.createElement("div");
        el.className = styles.portalRoot;
        document.body.appendChild(el);
        setPortalEl(el);
        return () => {
            document.body.removeChild(el);
        };
    }, []);

    const toggleMode = () => setMode((m) => (m === "ALIEN" ? "GHOST" : "ALIEN"));

    return (
        <>
            {portalEl &&
                createPortal(
                    <>
                        {/* Layer VUOTI: ParallaxAliens aggiunge nave, proiettili e alieni */}
                        <div className="space-ship-container" />
                        <div className="bullet-layer" />
                        <div className="aliens-layer" />
                        <ParallaxAliens mode={mode} />
                    </>,
                    portalEl
                )}

            <button
                type="button"
                className={styles.gameToggle}
                aria-label="Cambia tipo nemici"
                title={mode === "ALIEN" ? "Passa ai fantasmini 👻" : "Torna agli alieni 👾"}
                onClick={toggleMode}
            >
                {mode === "ALIEN" ? "👾→👻" : "👻→👾"}
            </button>
        </>
    );
}
