"use client";

import { useState } from "react";
import styles from "./FinanceStyles.module.css";

export default function FinanceAddModal({ onClose, onCreated, currentUser }) {
    const [form, setForm] = useState({
        type: "expense", // "expense" | "income"
        title: "",
        reason: "",
        amount: "",
    });
    const [busy, setBusy] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const payload = {
                type: form.type,
                title: form.title,
                reason: form.reason,
                amount: Number(form.amount || 0),
            };
            const res = await fetch("/api/finances", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                alert("Errore nel salvataggio");
                return;
            }
            const created = await res.json();
            onCreated?.(created);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHead}>
                    <h3>Nuova voce</h3>
                    <button className={styles.btnGhost} onClick={onClose} aria-label="Chiudi">✕</button>
                </div>

                <form className={styles.modalForm} onSubmit={onSubmit}>
                    <div className={styles.rowTwo}>
                        <label className={styles.selectWrap}>
                            Tipo
                            <select name="type" value={form.type} onChange={onChange}>
                                <option value="expense">Spesa</option>
                                <option value="income">Ricavo</option>
                            </select>
                        </label>
                        <label>
                            Importo (€)
                            <input
                                type="number"
                                name="amount"
                                min="0"
                                step="0.01"
                                value={form.amount}
                                onChange={onChange}
                                placeholder="0.00"
                                required
                            />
                        </label>
                    </div>

                    <label>
                        Titolo
                        <input
                            name="title"
                            value={form.title}
                            onChange={onChange}
                            placeholder="Es. Fornitura materiali"
                            required
                        />
                    </label>

                    <label>
                        Motivazione / Descrizione
                        <textarea
                            name="reason"
                            rows={3}
                            value={form.reason}
                            onChange={onChange}
                            placeholder="Dettagli operazione…"
                            required
                        />
                    </label>

                    <div className={styles.modalActions}>
                        <button type="button" className={styles.btnGhost} onClick={onClose}>Annulla</button>
                        <button type="submit" className={styles.btn} disabled={busy}>
                            Salva
                        </button>
                    </div>

                    <div className={styles.meta}>
                        <span>Utente: <b>{currentUser?.name || currentUser?.email || "-"}</b></span>
                        <span>Ora locale: <b>{new Date().toLocaleString()}</b></span>
                    </div>
                </form>
            </div>
        </div>
    );
}
