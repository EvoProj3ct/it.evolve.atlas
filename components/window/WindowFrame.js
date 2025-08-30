"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useWindows } from "./WindowManager";
import styles from "./WindowsStyles.module.css";

/**
 * Finestra riutilizzabile con barra (minimize / maximize-link / close).
 * - Legge/storicizza lo stato dal WindowManager
 * - Mantiene la barra visibile dopo il primo hover (pin)
 * - Minimizzata => nascosta (finisce nella Tray)
 * - Chiusa => non renderizza (ma si auto-ripristina dopo reopenMs)
 */
export default function WindowFrame({
                                        id,
                                        title,
                                        maximizeHref = "/chi-siamo",
                                        children,
                                        reopenMs = 8000, // ms; puoi modificarlo dove usi il componente
                                    }) {
    const { state, register, pin, minimize, close, restore } = useWindows();
    const w = state.byId[id] || { pinned: false, minimized: false, closed: false };

    const reopenTimerRef = useRef(null);
    const [reopening, setReopening] = useState(false);

    useEffect(() => {
        register(id, title);
    }, [id, title, register]);

    useEffect(() => {
        return () => {
            if (reopenTimerRef.current) clearTimeout(reopenTimerRef.current);
        };
    }, []);

    const isHidden = w.minimized || w.closed;
    const contentClass = [
        styles.content,
        w.pinned ? styles.keepBar : "",
        isHidden ? styles.isHidden : "",
        reopening ? styles.fadeIn : "",
    ].join(" ");

    const onClose = () => {
        close(id);

        if (reopenTimerRef.current) clearTimeout(reopenTimerRef.current);
        reopenTimerRef.current = setTimeout(() => {
            setReopening(true);
            restore(id);
            setTimeout(() => setReopening(false), 1000);
        }, reopenMs);

        // scroll alla prossima sezione visibile
        const section = document.getElementById(id)?.closest("section");
        const next = section?.nextElementSibling;
        next?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const onMinimize = () => {
        minimize(id);
    };
    const onFirstHoverOrFocus = () => {
        if (!w.pinned) pin(id);
    };

    if (w.closed && !reopening) return null;

    return (
        <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
            <div
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
                    <Link
                        href={maximizeHref}
                        className={`${styles.btn} ${styles.max}`}
                        title="Ingrandisci"
                        aria-label="Ingrandisci"
                    />
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.cls}`}
                        title="Chiudi"
                        aria-label="Chiudi"
                        onClick={onClose}
                    />
                </div>

                <h2 id={`${id}-title`} className="title">
                    {title}
                </h2>
                <div className="description">{children}</div>
            </div>
        </section>
    );
}
