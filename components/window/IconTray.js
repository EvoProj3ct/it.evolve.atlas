"use client";

import React from "react";
import { useWindowManager } from "./WindowManager";

/**
 * Tray con le icone delle finestre minimizzate.
 * Cliccando sull'icona → riapre la finestra e scrolla ad essa.
 */
export default function IconTray() {
    const { state, reopen } = useWindowManager();
    const minimized = Object.values(state.windows).filter((w) => w.minimized);

    const handleRestore = (id) => {
        reopen(id);
        const el = document.querySelector(`[data-window-id="${id}"]`);
        if (el && el.scrollIntoView) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    if (minimized.length === 0) return null;

    return (
        <div className="icon-tray" aria-label="Finestre minimizzate">
            {minimized.map((win) => (
                <button
                    key={win.id}
                    type="button"
                    className="window-icon"
                    title={win.title}
                    aria-label={`Riapri ${win.title}`}
                    onClick={() => handleRestore(win.id)}
                >
                    {win.title.slice(0, 1) || "?"}
                </button>
            ))}
        </div>
    );
}
