"use client";

import React, { useRef } from "react";
import { useWindows } from "./WindowManager";
import styles from "./WindowsStyles.module.css";

/**
 * Icone delle finestre minimizzate:
 * - trascinabili (restano chiuse mentre trascini)
 * - si APRONO solo con click “pulito” (nessun drag)
 */
export default function WindowTray() {
  const { state, restore, setIconPos } = useWindows();
  const minimized = Object.values(state.byId).filter(w => w.minimized && !w.closed);

  // stato per distinguere drag da click
  const dragRef = useRef({ id: null, moved: false, startX: 0, startY: 0 });

  const navVar = typeof window !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue("--nav-height")
      : "56px";
  const NAV_H = parseInt(navVar, 10) || 56;

  const onPointerDown = (e, w) => {
    const el = e.currentTarget;
    el.setPointerCapture?.(e.pointerId);
    el.classList.add(styles.dragging);
    dragRef.current = { id: w.id, moved: false, startX: e.clientX, startY: e.clientY };

    const move = (ev) => {
      // se ci si muove abbastanza, è drag ⇒ NON aprire al click
      if (!dragRef.current.moved) {
        const dx = Math.abs(ev.clientX - dragRef.current.startX);
        const dy = Math.abs(ev.clientY - dragRef.current.startY);
        if (dx + dy > 3) dragRef.current.moved = true;
      }

      const x = Math.max(8, Math.min(window.innerWidth - 50, ev.clientX - 21)); // 21 ≈ metà tassello
      const minY = NAV_H + 8; // sotto navbar
      const y = Math.max(minY, Math.min(window.innerHeight - 50, ev.clientY - 21));
      setIconPos(w.id, x, y);
    };

    const up = () => {
      el.releasePointerCapture?.(e.pointerId);
      el.classList.remove(styles.dragging);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onClickIcon = (e, w) => {
    // se c'è stato drag, ignoro il click (rimane chiusa)
    if (dragRef.current.id === w.id && dragRef.current.moved) return;
    restore(w.id);
    document.querySelector(`[data-window-id="${w.id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (minimized.length === 0) return null;

  return (
      <div className={styles.trayLayer} aria-label="Finestre minimizzate">
        {minimized.map((w) => {
          const x = w.iconPos?.x ?? 12;
          const y = w.iconPos?.y ?? (NAV_H + 8);
          const style = { left: x, top: y };
          return (
              <button
                  key={w.id}
                  type="button"
                  className={`${styles.iconTile} ${styles.ring}`}
                  title={`Riapri ${w.title}`}
                  aria-label={`Riapri ${w.title}`}
                  style={style}
                  onPointerDown={(e) => onPointerDown(e, w)}
                  onClick={(e) => onClickIcon(e, w)}   // SOLO click apre
              >
                {w.title?.slice(0,1) || "□"}
              </button>
          );
        })}
      </div>
  );
}
