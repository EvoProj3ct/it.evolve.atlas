"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWindows } from "./WindowManager";
import styles from "./WindowsStyles.module.css";

/**
 * Finestra riutilizzabile con barra (minimize / maximize-link / close).
 * - Stato gestito da WindowManager
 * - Dopo primo hover/focus la barra resta visibile (pin)
 * - Minimizzata => scompare con animazione, compare icona trascinabile
 * - Close => si auto-ripristina dopo reopenMs
 * - Maximize (verde) => animazione full-screen e poi navigate
 */
export default function WindowFrame({
                                        id,
                                        title,
                                        maximizeHref = "/chi-siamo",
                                        children,
                                        reopenMs = 8000,
                                    }) {
    const router = useRouter();
    const { state, register, pin, minimize, close, restore } = useWindows();
    const w = state.byId[id] || { pinned: false, minimized: false, closed: false };

    const reopenTimerRef = useRef(null);
    const [reopening, setReopening] = useState(false);
    const [minimizing, setMinimizing] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => { register(id, title); }, [id, title, register]);
    useEffect(() => () => { if (reopenTimerRef.current) clearTimeout(reopenTimerRef.current); }, []);

    const isHidden = w.minimized || w.closed;
    const contentClass = [
        styles.content,
        w.pinned ? styles.keepBar : "",
        isHidden ? styles.isHidden : "",
        reopening ? styles.fadeIn : "",
        minimizing ? styles.minimizing : "",
    ].join(" ");

    const onClose = () => {
        close(id);
        if (reopenTimerRef.current) clearTimeout(reopenTimerRef.current);
        reopenTimerRef.current = setTimeout(() => {
            setReopening(true);
            restore(id);
            setTimeout(() => setReopening(false), 1000);
        }, reopenMs);

        document.getElementById(id)?.closest("section")?.nextElementSibling
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const onMinimize = () => {
        setMinimizing(true);
        setTimeout(() => {
            setMinimizing(false);
            minimize(id);
        }, 250);
    };

    const onFirstHoverOrFocus = () => { if (!w.pinned) pin(id); };

    // ▶ Maximize: animazione full-screen e poi navigate
    const onMaximize = (e) => {
        e.preventDefault();
        const card = contentRef.current;
        if (!card) { router.push(maximizeHref); return; }

        const rect = card.getBoundingClientRect();
        // ghost overlay
        const ghost = document.createElement("div");
        Object.assign(ghost.style, {
            position: "fixed",
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            background: getComputedStyle(card).backgroundColor || "var(--background)",
            border: "4px solid var(--color-primary)",
            boxShadow: "4px 4px 0 var(--color-primary)",
            zIndex: "9999",
            pointerEvents: "none",
            borderRadius: "0px",
        });
        document.body.appendChild(ghost);

        // nascondo la card reale durante il flash
        card.style.visibility = "hidden";

        // calcolo target: pieno schermo sotto la navbar
        const navVar = getComputedStyle(document.documentElement).getPropertyValue("--nav-height");
        const navH = parseInt(navVar, 10) || 56;
        const targetTop = Math.max(0, navH);
        const duration = 300;

        const anim = ghost.animate(
            [
                { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderWidth: "4px", offset: 0 },
                { left: "0px", top: `${targetTop}px`, width: "100vw", height: `${window.innerHeight - targetTop}px`, borderWidth: "6px", offset: 1 }
            ],
            { duration, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" }
        );

        anim.onfinish = () => {
            document.body.removeChild(ghost);
            card.style.visibility = "";
            router.push(maximizeHref);
        };

        // fallback in caso di interruzioni
        setTimeout(() => {
            if (document.body.contains(ghost)) {
                document.body.removeChild(ghost);
                card.style.visibility = "";
                router.push(maximizeHref);
            }
        }, duration + 80);
    };

    if (w.closed && !reopening) return null;

    return (
        <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
            <div
                ref={contentRef}
                className={contentClass}
                data-window-id={id}
                aria-hidden={isHidden ? "true" : "false"}
                onMouseEnter={onFirstHoverOrFocus}
                onFocusCapture={onFirstHoverOrFocus}
            >
                <div className={styles.windowBar}>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.min}`}
                        title="Riduci"
                        aria-label="Riduci"
                        onClick={onMinimize}
                    />
                    {/* button + handler per animazione, poi navigate */}
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.max}`}
                        title="Ingrandisci"
                        aria-label="Ingrandisci"
                        onClick={onMaximize}
                    />
                    {/* close */}
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.cls}`}
                        title="Chiudi"
                        aria-label="Chiudi"
                        onClick={onClose}
                    />
                </div>

                <h2 id={`${id}-title`} className={styles.title}>{title}</h2>
                <div className={styles.description}>{children}</div>
            </div>
        </section>
    );
}
