"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useWindows } from "./WindowManager";

/**
 * Finestra riutilizzabile.
 * - Barra con 3 pulsanti (minimize / maximize / close).
 * - "Pin" dopo primo hover/focus (barra e zoom persistono).
 * - Rispetta le classi del tuo CSS: .home-section, .content, .window-bar, .window-btn...
 */
export default function WindowFrame({ id, title, maximizeHref = "/chi-siamo", children }) {
  const { state, register, pin, minimize, close } = useWindows();
  const w = state.byId[id] || { pinned: false, minimized: false, closed: false };

  // Registra la finestra quando compare
  useEffect(() => { register(id, title); }, [id, title, register]);

  // Nascosta se minimized o closed
  const isHidden = w.minimized || w.closed;
  // Pinned = barra visibile e zoom persistenti (classe keep-bar)
  const contentClass =
      "content" + (isHidden ? " is-hidden" : "") + (w.pinned ? " keep-bar" : "");

  const onClose = () => {
    close(id);
    // Scroll alla prossima sezione (pari al tuo comportamento originario)
    const section = document.getElementById(id)?.closest("section");
    const next = section?.nextElementSibling;
    next?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onMinimize = () => {
    minimize(id);
    // niente scroll: l'utente ha l'icona in tray per ripristinare
  };

  const onFirstHoverOrFocus = () => {
    if (!w.pinned) pin(id); // pin una sola volta
  };

  return (
      <section id={id} className="home-section" aria-labelledby={`${id}-title`}>
        <div
            className={contentClass}
            data-window-id={id}
            aria-hidden={isHidden ? "true" : "false"}
            onMouseEnter={onFirstHoverOrFocus}
            onFocusCapture={onFirstHoverOrFocus}
        >
          {/* BARRA: i bottoni sono vuoti perché il TUO CSS aggiunge i simboli via ::before */}
          <div className="window-bar">
            <button
                type="button"
                className="window-btn minimize"
                title="Riduci"
                aria-label="Riduci"
                onClick={onMinimize}
            />
            <Link
                href={maximizeHref}
                className="window-btn maximize"
                title="Ingrandisci"
                aria-label="Ingrandisci"
            />
            <button
                type="button"
                className="window-btn close"
                title="Chiudi"
                aria-label="Chiudi"
                onClick={onClose}
            />
          </div>

          <h2 id={`${id}-title`} className="title">{title}</h2>
          <div className="window-body">{children}</div>
        </div>
      </section>
  );
}
