"use client";
import React, { useState } from "react";
import ParallaxAliens from "./ParallaxAliens";
import g from "./GameStyles.module.css";

export default function HomeParallax() {
    const [mode, setMode] = useState("ALIEN"); // "ALIEN" | "GHOST"
    const toggleMode = () => setMode((m) => (m === "ALIEN" ? "GHOST" : "ALIEN"));

    return (
        <>
            {/* LAYER FISSI: ParallaxAliens crea/controlla entity dentro questi container */}
            <div className={g.shipLayer} />    {/* nave */}
            <div className={g.bullets} />      {/* proiettili */}
            <div className={g.aliens} />       {/* alieni */}

            <ParallaxAliens mode={mode} />

            {/* Switch in basso a destra (non invade navbar/footer) */}
            <button
                type="button"
                className={g.toggle}
                aria-label="Cambia tipo nemici"
                title={mode === "ALIEN" ? "Passa ai fantasmini 👻" : "Torna agli alieni 👾"}
                onClick={toggleMode}
            >
                {mode === "ALIEN" ? "👾→👻" : "👻→👾"}
            </button>
        </>
    );
}
