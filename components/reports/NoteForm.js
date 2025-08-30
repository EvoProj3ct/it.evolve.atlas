"use client";

import { useState } from "react";
import styles from "./ReportsWidgets.module.css";

export default function NoteForm({ onCreated, currentUser }) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        hasAmount: false,
        amount: "",
    });
    const [busy, setBusy] = useState(false);

    const onChange = (e) => {
        const { name, type } = e.target;
        const value = type === "checkbox" ? e.target.checked : e.target.value;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const payload = {
                title: form.title,
                description: form.description,
                hasAmount: Boolean(form.hasAmount),
                amount: form.hasAmount ? Number(form.amount || 0) : null,
            };
            const res = await fetch("/api/notes", {
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
            setForm({ title: "", description: "", hasAmount: false, amount: "" });
        } finally {
            setBusy(false);
        }
    };

    return (
        <form className={styles.noteForm} onSubmit={onSubmit}>
            <div className={styles.row}>
                <label>Titolo</label>
                <input
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    placeholder="Titolo della nota"
                    required
                />
            </div>

            <div className={styles.row}>
                <label>Descrizione</label>
                <textarea
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={onChange}
                    placeholder="Dettagli, contesto, riferimenti…"
                    required
                />
            </div>

            <div className={`${styles.row} ${styles.inline}`}>
                <label className={styles.check}>
                    <input
                        type="checkbox"
                        name="hasAmount"
                        checked={form.hasAmount}
                        onChange={onChange}
                    />
                    <span>Nota spesa (aggiungi importo)</span>
                </label>

                {form.hasAmount && (
                    <div className={styles.amountBox}>
                        <span>€</span>
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
                    </div>
                )}
            </div>

            <div className={styles.row}>
                <button type="submit" className={styles.btn} disabled={busy}>
                    + Aggiungi Nota
                </button>
            </div>

            <div className={styles.meta}>
        <span>
          Utente: <b>{currentUser?.name || currentUser?.email || "-"}</b>
        </span>
                <span>
          Ora locale: <b>{new Date().toLocaleString()}</b>
        </span>
            </div>
        </form>
    );
}
