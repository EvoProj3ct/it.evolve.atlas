"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

/**
 * props:
 * - id
 * - pages: [{ type: "image", src, alt } | { type: "text", content } | { type:"link", href, label }]
 * - onClose
 */
export default function GameBoyPanel({ id, pages = [], onClose }) {
    const [idx, setIdx] = useState(0);
    const screenRef = useRef(null);

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    const go = (delta) => setIdx((i) => clamp(i + delta, 0, pages.length - 1));

    useEffect(() => {
        screenRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [idx]);

    const scrollBy = (dx, dy) => {
        const el = screenRef.current;
        if (!el) return;
        el.scrollBy({ left: dx, top: dy, behavior: "smooth" });
    };

    const page = pages[idx];
    const showHint = idx === 0 && pages.length > 1;

    return (
        <div className="gb-panel" id={id}>
            <div className="gb-header">
                <span className="gb-title">INFO</span>
                <button type="button" className="gb-close" onClick={onClose} aria-label="Chiudi">
                    X
                </button>
            </div>

            <div className="gb-body">
                <div className="gb-screen" ref={screenRef} tabIndex={0} aria-live="polite">
                    {page?.type === "image" && (
                        <div className="gb-photo">
                            <Image src={page.src} alt={page.alt || ""} fill sizes="360px" />
                            {showHint && <div className="gb-hint">▶</div>}
                        </div>
                    )}

                    {page?.type === "text" && (
                        <div className="gb-screen-inner">
                            <p>{page.content}</p>
                        </div>
                    )}

                    {page?.type === "link" && (
                        <div className="gb-screen-inner">
                            <a className="founder-link" href={page.href}>
                                {page.label}
                            </a>
                        </div>
                    )}
                </div>

                <div className="gb-pad">
                    <div className="gb-pad-grid">
                        <button className="gb-btn" onClick={() => scrollBy(0, -90)} aria-label="Su">▲</button>
                        <button className="gb-btn" onClick={() => go(-1)} aria-label="Pagina precedente">◀</button>
                        <span className="gb-dot">{idx + 1}/{pages.length}</span>
                        <button className="gb-btn" onClick={() => go(+1)} aria-label="Pagina successiva">▶</button>
                        <button className="gb-btn" onClick={() => scrollBy(0, +90)} aria-label="Giù">▼</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
