"use client";

import { useState } from "react";
import styles from "./ReportsWidgets.module.css";

export default function NoteCard({ note, onPatched, currentUser, mode = "detail" }) {
    const [append, setAppend] = useState("");
    const [busy, setBusy] = useState(false);

    const patch = async (payload) => {
        setBusy(true);
        try {
            const res = await fetch("/api/notes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: note._id, ...payload }),
            });
            if (!res.ok) {
                alert("Errore nell'aggiornamento");
                return;
            }
            const updated = await res.json();
            onPatched?.(updated);
            setAppend("");
        } finally {
            setBusy(false);
        }
    };

    const onResolve = () => patch({ action: "resolve" });
    const onAppend = (e) => {
        e.preventDefault();
        if (!append.trim()) return;
        patch({ action: "append", text: append });
    };

    const isCompact = mode === "compact";

    return (
        <article
            className={`${styles.noteCard} ${isCompact ? styles.compact : ""}`}
            data-status={note.status}
        >
            <header className={styles.cardHead}>
                <div className={styles.headLeft}>
          <span
              className={`${styles.stateIcon} ${
                  note.status === "resolved" ? styles.ok : styles.wait
              }`}
              title={note.status === "resolved" ? "Risolto" : "In sospeso"}
          />
                    <h3 className={styles.titleClamp}>{note.title}</h3>
                </div>

                <div className={styles.headRight}>
                    {note.hasAmount && (
                        <span className={styles.amount}>€ {Number(note.amount || 0).toFixed(2)}</span>
                    )}
                    {!isCompact && (
                        <>
                            {note.status === "pending" ? (
                                <button
                                    className={`${styles.btn} ${styles.small}`}
                                    onClick={onResolve}
                                    disabled={busy}
                                >
                                    ✓ Risolvi
                                </button>
                            ) : (
                                <span className={styles.resolvedBy}>
                  Risolto da: <b>{note.resolvedBy || "-"}</b>
                </span>
                            )}
                        </>
                    )}
                </div>
            </header>

            {!isCompact && (
                <>
                    <div className={styles.cardBody}>
                        <p className={styles.desc}>{note.description}</p>
                    </div>

                    <footer className={styles.cardFoot}>
                        <div className={styles.metaLeft}>
                            <span>Creato da: {note.createdBy || "-"}</span>
                            <span>{note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}</span>
                            {note.updatedAt && <span>Agg.: {new Date(note.updatedAt).toLocaleString()}</span>}
                        </div>

                        {/* Append solo testo alla descrizione */}
                        {note.status === "pending" && (
                            <form onSubmit={onAppend} className={styles.appendForm}>
                                <input
                                    className={styles.appendInput}
                                    value={append}
                                    onChange={(e) => setAppend(e.target.value)}
                                    placeholder="Aggiungi testo alla descrizione…"
                                />
                                <button className={`${styles.btn} ${styles.small}`} disabled={busy || !append.trim()}>
                                    ➕
                                </button>
                            </form>
                        )}
                    </footer>
                </>
            )}

            {isCompact && (
                <div className={styles.compactBody}>
                    <p className={styles.compactDesc}>{note.description}</p>
                </div>
            )}
        </article>
    );
}
