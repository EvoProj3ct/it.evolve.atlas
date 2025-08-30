"use client";

import styles from "./FinanceStyles.module.css";

/**
 * items: [{ createdAt, type: "income"|"expense", amount }]
 * Mostra una linea del saldo cumulativo.
 */
export default function FinanceChart({ items, loading }) {
    // ordina per data ASC e calcola cumulative
    const sorted = [...(items || [])]
        .filter((x) => x.createdAt)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const points = [];
    let cum = 0;
    sorted.forEach((it, i) => {
        const sign = it.type === "income" ? 1 : -1;
        cum += sign * Number(it.amount || 0);
        points.push({ i, value: cum, date: new Date(it.createdAt) });
    });

    // se nessun dato, mostra placeholder
    if (loading) return <div className={styles.loading}>Caricamento grafico…</div>;
    if (points.length === 0) return <div className={styles.empty}>Nessun dato da mostrare.</div>;

    const width = 820;     // area disegno
    const height = 260;
    const pad = 24;

    const minV = Math.min(0, ...points.map((p) => p.value));
    const maxV = Math.max(0, ...points.map((p) => p.value));
    const spanV = Math.max(1, maxV - minV);

    const maxI = Math.max(1, points.length - 1);

    const mapX = (idx) => pad + (idx / maxI) * (width - pad * 2);
    const mapY = (val) => {
        const t = (val - minV) / spanV; // 0..1
        return height - pad - t * (height - pad * 2);
    };

    const d = points.map((p) => `${mapX(p.i)},${mapY(p.value)}`).join(" ");

    // asse zero
    const y0 = mapY(0);

    return (
        <div className={styles.chartWrap}>
            <svg className={styles.chart} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Saldo nel tempo">
                {/* griglia orizzontale */}
                <g opacity="0.3">
                    {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                        const y = pad + t * (height - pad * 2);
                        return <line key={t} x1={pad} x2={width - pad} y1={y} y2={y} stroke="var(--color-primary)" strokeDasharray="4 6" />;
                    })}
                </g>

                {/* asse zero */}
                <line x1={pad} x2={width - pad} y1={y0} y2={y0} stroke="var(--color-primary)" strokeWidth="2" />

                {/* polilinea saldo */}
                <polyline
                    points={d}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="4"
                    filter="url(#glow)"
                />

                {/* punti */}
                {points.map((p) => (
                    <circle key={p.i} cx={mapX(p.i)} cy={mapY(p.value)} r="4" fill="var(--color-primary)" />
                ))}

                {/* glow filter */}
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>
        </div>
    );
}
