"use client";

import React, { useEffect, useState } from "react";

/**
 * Barra verticale di progresso (usa le tue classi .progress-container / .progress-bar).
 * rAF + resize + ARIA.
 */
export default function ScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let rafId = null;

        const update = () => {
            const doc = document.documentElement;
            const total = doc.scrollHeight - doc.clientHeight;
            const y = window.scrollY || doc.scrollTop || 0;
            const p = total > 0 ? (y / total) * 100 : 0;
            setProgress(Math.min(100, Math.max(0, p)));
            rafId = null;
        };

        const onScrollOrResize = () => {
            if (rafId != null) return;
            rafId = requestAnimationFrame(update);
        };

        window.addEventListener("scroll", onScrollOrResize, { passive: true });
        window.addEventListener("resize", onScrollOrResize);
        onScrollOrResize();

        return () => {
            window.removeEventListener("scroll", onScrollOrResize);
            window.removeEventListener("resize", onScrollOrResize);
            if (rafId != null) cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div
            className="progress-container"
            role="progressbar"
            aria-label="Progresso di scorrimento"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
        >
            <div className="progress-bar" style={{ height: `${progress}%` }} />
        </div>
    );
}
