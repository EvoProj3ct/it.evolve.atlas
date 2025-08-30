"use client";
import { useState } from "react";
import styles from "./GameStyles.module.css";
import ParallaxAliens from "./ParallaxAliens";

export default function HomeParallax() {
    const [mode, setMode] = useState("ALIEN"); // "ALIEN" | "GHOST"
    const toggleMode = () => setMode((m) => (m === "ALIEN" ? "GHOST" : "ALIEN"));

    return (
        <div className={styles.gameRoot}>
            {/* Layer VUOTI: ParallaxAliens aggiunge nave, proiettili e alieni */}
            <div className="space-ship-container" />
            <div className="bullet-layer" />
            <div className="aliens-layer" />

            <ParallaxAliens mode={mode} />

            <button
                type="button"
                className="game-toggle"
                aria-label="Cambia tipo nemici"
                title={mode === "ALIEN" ? "Passa ai fantasmini 👻" : "Torna agli alieni 👾"}
                onClick={toggleMode}
            >
                {mode === "ALIEN" ? "👾→👻" : "👻→👾"}
            </button>
        </div>
    );
}
