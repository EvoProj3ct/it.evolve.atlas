"use client";

import React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Carichiamo il "gioco" solo lato client
const ParallaxAliens = dynamic(() => import("./ParallaxAliens"), { ssr: false });

export default function HomeParallax() {
    const pathname = usePathname();
    if (pathname !== "/") return null;

    return (
        <>
            <ParallaxAliens />
            <div className="space-ship-container">
                {/* Puoi valutare <Image> di Next.js per asset statici principali */}
                <img src="/ship.svg" alt="" className="bottom-ship ship-fluo" />
            </div>
            <div className="bullet-layer"></div>
            <div className="aliens-layer"></div>
        </>
    );
}
