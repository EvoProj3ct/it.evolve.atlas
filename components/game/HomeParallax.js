"use client";

import React from "react";
import ParallaxAliens from "./ParallaxAliens";

/**
 * Strati del mini-gioco: navicella, proiettili, alieni.
 * Il CSS che hai postato posiziona e stila questi layer.
 */
export default function HomeParallax() {
    return (
        <>
            <div className="space-ship-container">
                <img src="/ship.svg" alt="" className="bottom-ship ship-fluo" />
            </div>
            <div className="bullet-layer" />
            <div className="aliens-layer" />
            <ParallaxAliens />
        </>
    );
}
