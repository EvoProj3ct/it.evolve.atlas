"use client";
import React, { useState } from "react";
import ParallaxAliens from "./ParallaxAliens";
import styles from "./GameStyles.module.css";

export default function HomeParallax() {
    const [mode, setMode] = useState("ALIEN");
    const toggleMode = () => setMode(m => (m === "ALIEN" ? "GHOST" : "ALIEN"));

    return (
        <>
            {/* data-attributes: ParallaxAliens li usa per agganciarsi */}
            <div data-game="ship-layer" className={styles.shipLayer} />
            <div data-game="bullets"    className={styles.bullets} />
            <div data-game="aliens"     className={styles.aliens} />

            <ParallaxAliens mode={mode} />

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
