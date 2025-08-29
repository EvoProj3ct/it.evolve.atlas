"use client";
import React, { useState } from "react";
import ParallaxAliens from "./ParallaxAliens";

export default function HomeParallax() {
    const [mode, setMode] = useState("ALIEN"); // "ALIEN" | "GHOST"
    const toggleMode = () => setMode((m) => (m === "ALIEN" ? "GHOST" : "ALIEN"));

    return (
        <>
            {/* Layer VUOTI: la nave/mostri vengono creati in ParallaxAliens */}
            <div className="space-ship-container" />
            <div className="bullet-layer" />
            <div className="aliens-layer" />

            <ParallaxAliens mode={mode} />

            {/* Switch in basso a destra */}
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
