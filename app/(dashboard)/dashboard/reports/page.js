"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

// usa l’alias corretto per il tuo progetto
import styles from "@/components/reports/ReportsStyles.module.css";
import NoteForm from "@/components/reports/NoteForm";
import NoteCard from "@/components/reports/NoteCard";

export default function ReportsPage() {
    const { status, data } = useSession();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);

    const carouselRef = useRef(null);

    if (status === "unauthenticated") redirect("/login");

    const load = async () => {
        try {
            const res = await fetch("/api/notes");
            const json = await res.json();
            setItems(json);
            if (json?.length && !selectedId) setSelectedId(json[0]._id);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selected = useMemo(
        () => items.find((n) => n._id === selectedId) || null,
        [items, selectedId]
    );

    const handleCreated = (created) => {
        setItems((prev) => [created, ...prev]);
        setSelectedId(created._id);
        // scroll fino alla prima slide
        requestAnimationFrame(() => scrollToIndex(0));
    };

    const handlePatched = (updated) => {
        setItems((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
        setSelectedId(updated._id);
    };

    const scrollToIndex = (i) => {
        const wrap = carouselRef.current;
        if (!wrap) return;
        const slide = wrap.querySelectorAll(`.${styles.slide}`)[i];
        if (slide) slide.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    };

    const onPrev = () => {
        if (!items.length) return;
        const idx = items.findIndex((n) => n._id === selectedId);
        const nextIdx = Math.max(0, idx - 1);
        setSelectedId(items[nextIdx]._id);
        scrollToIndex(nextIdx);
    };

    const onNext = () => {
        if (!items.length) return;
        const idx = items.findIndex((n) => n._id === selectedId);
        const nextIdx = Math.min(items.length - 1, idx + 1);
        setSelectedId(items[nextIdx]._id);
        scrollToIndex(nextIdx);
    };

    return (
        <section className={styles.reports}>
            <h1 className="title">Reports</h1>
            <p className="description">
                Sfoglia i tuoi <em>foglietti</em> nel carosello qui sotto e modificali dalla sezione editor.
            </p>

            {/* ————————————————— Carosello ————————————————— */}
            <div className={styles.carouselWrap}>
                <button
                    type="button"
                    className={`${styles.navBtn} ${styles.left}`}
                    aria-label="Precedente"
                    onClick={onPrev}
                    disabled={!items.length || loading}
                >
                    ◀
                </button>

                <div className={styles.carousel} ref={carouselRef} aria-label="Elenco note">
                    {loading ? (
                        <div className={styles.loading}>Caricamento…</div>
                    ) : items.length === 0 ? (
                        <div className={styles.empty}>Nessuna nota presente.</div>
                    ) : (
                        items.map((it) => (
                            <div
                                key={it._id}
                                className={`${styles.slide} ${selectedId === it._id ? styles.active : ""}`}
                                onClick={() => setSelectedId(it._id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedId(it._id)}
                            >
                                <NoteCard note={it} mode="compact" />
                            </div>
                        ))
                    )}
                </div>

                <button
                    type="button"
                    className={`${styles.navBtn} ${styles.right}`}
                    aria-label="Successivo"
                    onClick={onNext}
                    disabled={!items.length || loading}
                >
                    ▶
                </button>
            </div>

            {/* ————————————————— Editor nota selezionata ————————————————— */}
            <div className={styles.editorWindow}>
                <div className={styles.windowBar}>
                    <span className={`${styles.dot} ${styles.blue}`} />
                    <span className={`${styles.dot} ${styles.green}`} />
                    <span className={`${styles.dot} ${styles.red}`} />
                </div>

                {!selected ? (
                    <div className={styles.empty}>Seleziona una nota dal carosello.</div>
                ) : (
                    <NoteCard
                        note={selected}
                        onPatched={handlePatched}
                        currentUser={data?.user}
                        mode="detail"
                    />
                )}
            </div>

            {/* ————————————————— Nuova nota ————————————————— */}
            <div className={styles.window}>
                <div className={styles.windowBar}>
                    <span className={`${styles.dot} ${styles.blue}`} />
                    <span className={`${styles.dot} ${styles.green}`} />
                    <span className={`${styles.dot} ${styles.red}`} />
                </div>
                <NoteForm onCreated={handleCreated} currentUser={data?.user} />
            </div>
        </section>
    );
}
