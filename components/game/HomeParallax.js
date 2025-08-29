"use client";
import React, { useState } from "react";
import ParallaxAliens from "./ParallaxAliens";

export default function HomeParallax() {
    const [mode, setMode] = useState("ALIEN"); // "ALIEN" | "GHOST"
    const toggleMode = () => setMode((m) => (m === "ALIEN" ? "GHOST" : "ALIEN"));

    return (
        <>
            <div className="space-ship-container">
                {/* emoji nave al posto della freccia */}
                <div className="ship-emoji" aria-hidden="true">🚀</div>
            </div>
            <div className="bullet-layer" />
            <div className="aliens-layer" />
            <ParallaxAliens mode={mode} />

            {/* Switch in basso a destra (non interferisce con navbar) */}
            <button
                type="button"
                className="game-toggle"
                aria-label="Cambia tipo nemici"
                title={mode === "ALIEN" ? "Passa ai fantasmini 👻" : "Torna agli alieni 👾"}
                onClick={toggleMode}
            >
                {mode === "ALIEN" ? "👾→👻" : "👻→👾"}
            </button>
        </>
    );
}
