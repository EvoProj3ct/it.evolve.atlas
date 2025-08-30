"use client";
import React, { useState } from "react";
import ParallaxAliens from "./ParallaxAliens";
import styles from "./GameStyles.module.css";

export default function HomeParallax() {
    const [mode, setMode] = useState("ALIEN"); // "ALIEN" | "GHOST"
    const toggleMode = () => setMode(m => (m === "ALIEN" ? "GHOST" : "ALIEN"));

    return (
        <>
            {/* Layer VUOTI: ParallaxAliens popola questi tre container */}
            <div className={styles.shipLayer} />
            <div className={styles.bullets} />
            <div className={styles.aliens} />

            <ParallaxAliens
                mode={mode}
                classNames={{
                    shipLayer: styles.shipLayer,
                    bullets: styles.bullets,
                    aliens: styles.aliens,
                    bullet: styles.bullet,
                    alien: styles.alien,
                    explosion: styles.explosion,
                }}
            />

            {/* Toggle in basso a SINISTRA */}
            <button
                type="button"
                className={styles.toggle}
                aria-label="Cambia tipo nemici"
                title={mode === "ALIEN" ? "Passa ai fantasmini 👻" : "Torna agli alieni 👾"}
                onClick={toggleMode}
            >
                {mode === "ALIEN" ? "👾→👻" : "👻→👾"}
            </button>
        </>
    );
}
