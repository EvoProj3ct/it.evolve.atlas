"use client";
import { useRef } from "react";

export default function GameBoyPanel({ id, content, onClose }) {
    const screenRef = useRef(null);

    const scrollBy = (dx, dy) => {
        const el = screenRef.current;
        if (!el) return;
        el.scrollBy({ left: dx, top: dy, behavior: "smooth" });
    };

    return (
        <div className="gb-panel" id={id}>
            <div className="gb-header">
                <span className="gb-title">INFO</span>
                <button type="button" className="gb-close" onClick={onClose} aria-label="Chiudi">X</button>
            </div>

            <div className="gb-body">
                <div className="gb-screen" ref={screenRef} tabIndex={0} aria-label="Schermo informazioni">
                    <div className="gb-screen-inner">
                        <p>{content}</p>
                    </div>
                </div>

                <div className="gb-pad">
                    <div className="gb-pad-grid">
                        <button className="gb-btn" onClick={() => scrollBy(0, -90)} aria-label="Su">▲</button>
                        <button className="gb-btn" onClick={() => scrollBy(-120, 0)} aria-label="Sinistra">◀</button>
                        <span className="gb-dot" aria-hidden>•</span>
                        <button className="gb-btn" onClick={() => scrollBy(120, 0)} aria-label="Destra">▶</button>
                        <button className="gb-btn" onClick={() => scrollBy(0, 90)} aria-label="Giù">▼</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
