"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./PixeledChatWidget.module.css";

/**
 * PixeledChatWidget (tondo, sobrio)
 * Props:
 * - label:        string                -> etichetta sotto al cerchio
 * - avatarSrc:    string                -> URL immagine/avatar
 * - initialText:  string                -> testo iniziale nella chat
 * - redirectHref: string                -> URL dove andare al submit
 * - ariaLabel:    string                -> label accessibilità bottone
 * - defaultOpen:  boolean               -> chat aperta all’inizio
 * - chatTitle:    string                -> titolo della chat (es. "Leo • Assistant")
 */
export default function PixeledChatWidget({
                                              label = "Serve aiuto?",
                                              avatarSrc = "",
                                              initialText = "TESTO",
                                              redirectHref = "/contatti",
                                              ariaLabel = "Apri chat di supporto",
                                              defaultOpen = false,
                                              chatTitle = "EVOLVE • BOT",
                                          }) {
    const [open, setOpen] = useState(defaultOpen);
    const [message, setMessage] = useState("");
    const containerRef = useRef(null);

    // ESC chiude
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();
        window.open(
            redirectHref,
            "_blank",                     // nuova scheda/finestra
            "noopener,noreferrer,width=480,height=600" // puoi regolare dimensioni e sicurezza
        );
    };

    return (
        <div className={styles.host} ref={containerRef} aria-live="polite">
            {/* FAB + etichetta: visibili SOLO quando la chat è chiusa */}
            {!open && (
                <>
                    <button
                        type="button"
                        className={`${styles.fab} ${styles.pulse}`}
                        aria-label={ariaLabel}
                        onClick={() => setOpen(true)}
                    >
                        {avatarSrc ? (
                            <img src={avatarSrc} alt="" className={styles.avatar} />
                        ) : (
                            <span className={styles.avatarPlaceholder} />
                        )}
                    </button>

                    <div className={`${styles.label} ${styles.pulse}`} role="note">
                        {label}
                    </div>
                </>
            )}

            {/* BOX CHAT */}
            {open && (
                <div className={styles.chat} role="dialog" aria-label="Chat">
                    <div className={styles.header}>
                        {/* Avatar grande (56px) come il FAB */}
                        <img
                            src={avatarSrc || "/favicon.ico"}
                            alt=""
                            className={styles.headerAvatar}
                        />
                        <span className={styles.title}>{chatTitle}</span>
                        <button
                            type="button"
                            className={styles.close}
                            aria-label="Chiudi"
                            onClick={() => setOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className={styles.body}>
                        <div className={styles.botBubble}>{initialText}</div>

                        <form className={styles.form} onSubmit={onSubmit}>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Scrivi qui…"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                aria-label="Messaggio"
                            />
                            <button className={styles.send} type="submit" aria-label="Invia">
                                ➤
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
