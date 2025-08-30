"use client";

//...

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

import styles from "@/components/finance/FinanceStyles.module.css";
import FinanceAddModal from "@/components/finance/FinanceAddModal";
import FinanceChart from "@/components/finance/FinanceChart";

export default function FinanzePage() {
    const { status, data } = useSession();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    if (status === "unauthenticated") redirect("/login");

    const load = async () => {
        try {
            const res = await fetch("/api/finances");
            const json = await res.json();
            setItems(json);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const balanceNow = useMemo(() => {
        return items.reduce((acc, it) => {
            const sign = it.type === "income" ? 1 : -1;
            return acc + sign * Number(it.amount || 0);
        }, 0);
    }, [items]);

    const onCreated = (created) => {
        setItems((prev) => [created, ...prev]);
        setOpen(false);
    };

    return (
        <section className={styles.page}>
            <h1 className="title">Finanze</h1>
            <p className="description">
                Aggiungi spese o ricavi, vedi l’elenco e il grafico del saldo cumulativo.
            </p>

            {/* Top actions */}
            <div className={styles.toolbar}>
                <div className={styles.balance}>
                    Saldo attuale:&nbsp;
                    <b>€ {balanceNow.toFixed(2)}</b>
                </div>
                <button className={styles.btn} onClick={() => setOpen(true)}>
                    + Aggiungi voce
                </button>
            </div>

            {/* Grafico saldo */}
            <div className={styles.window}>
                <div className={styles.windowBar}>
                    <span className={`${styles.dot} ${styles.blue}`} />
                    <span className={`${styles.dot} ${styles.green}`} />
                    <span className={`${styles.dot} ${styles.red}`} />
                </div>
                <FinanceChart items={items} loading={loading} />
            </div>

            {/* Lista */}
            <div className={styles.list}>
                {loading ? (
                    <div className={styles.loading}>Caricamento…</div>
                ) : items.length === 0 ? (
                    <div className={styles.empty}>Nessuna voce presente.</div>
                ) : (
                    items.map((it) => (
                        <article key={it._id} className={styles.card}>
                            <header className={styles.cardHead}>
                <span
                    className={`${styles.typeChip} ${
                        it.type === "income" ? styles.income : styles.expense
                    }`}
                />
                                <h3 className={styles.titleClamp}>{it.title}</h3>
                                <div className={styles.amount}>
                                    {it.type === "income" ? "+" : "−"} € {Number(it.amount).toFixed(2)}
                                </div>
                            </header>
                            <div className={styles.cardBody}>
                                <p className={styles.desc}>{it.reason}</p>
                            </div>
                            <footer className={styles.cardFoot}>
                                <span>Creato da: {it.createdBy || "-"}</span>
                                <span>{it.createdAt ? new Date(it.createdAt).toLocaleString() : ""}</span>
                            </footer>
                        </article>
                    ))
                )}
            </div>

            {/* Modal nuova voce */}
            {open && (
                <FinanceAddModal
                    onClose={() => setOpen(false)}
                    onCreated={onCreated}
                    currentUser={data?.user}
                />
            )}
        </section>
    );
}
