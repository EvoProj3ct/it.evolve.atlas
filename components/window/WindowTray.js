"use client";

import React from "react";
import { useWindows } from "./WindowManager";

/**
 * IconTray: mostra un bottone per ogni finestra minimizzata.
 * Clic = ripristina e scrolla alla finestra.
 */
export default function WindowTray() {
  const { state, restore } = useWindows();
  const minimized = Object.values(state.byId).filter(w => w.minimized && !w.closed);

  if (minimized.length === 0) return null;

  const onRestore = (id) => {
    restore(id);
    const el = document.querySelector(`[data-window-id="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
      <div className="icon-tray" aria-label="Finestre minimizzate">
        {minimized.map((w) => (
            <button
                key={w.id}
                type="button"
                className="window-icon"
                title={w.title}
                aria-label={`Riapri ${w.title}`}
                onClick={() => onRestore(w.id)}
            >
              {w.title.slice(0, 1) || "?"}
            </button>
        ))}
      </div>
  );
}
