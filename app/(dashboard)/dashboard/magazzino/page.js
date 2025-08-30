'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU'];

export default function MagazzinoPage() {
    const { status, data } = useSession();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        material: 'PLA',
        color: '',
        brand: '',
        weightKg: '1',
        cost: '0',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/filaments');
                const json = await res.json();
                setItems(json);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (status === 'unauthenticated') {
        // protezione lato client (quella lato server è sull’API)
        redirect('/login');
    }

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            material: form.material,
            color: form.color,
            brand: form.brand,
            weightKg: form.weightKg,
            cost: form.cost,
        };
        const res = await fetch('/api/filaments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            alert('Errore nel salvataggio');
            return;
        }
        const created = await res.json();
        setItems((list) => [created, ...list]);
        // reset soft
        setForm((f) => ({ ...f, color: '', brand: '', weightKg: '1', cost: '0' }));
    };

    return (
        <section className="warehouse">
            <h1 className="title">Magazzino</h1>
            <p className="description">
                Inserisci i rotoli di filamento. I campi <em>Utente</em> e <em>Timestamp</em> vengono salvati automaticamente.
            </p>

            {/* FINESTRA FORM */}
            <div className="window">
                <div className="window-bar"><span className="dot blue" /><span className="dot green" /><span className="dot red" /></div>

                <form className="warehouse-form" onSubmit={onSubmit}>
                    <div className="row">
                        <label>Materiale</label>
                        <select name="material" value={form.material} onChange={onChange}>
                            {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div className="row">
                        <label>Colore</label>
                        <input name="color" value={form.color} onChange={onChange} placeholder="Nero / Bianco / ..." required />
                    </div>

                    <div className="row">
                        <label>Marca</label>
                        <input name="brand" value={form.brand} onChange={onChange} placeholder="eSun / Sunlu / ..." required />
                    </div>

                    <div className="row two">
                        <div>
                            <label>Peso (kg)</label>
                            <input type="number" step="0.01" min="0" name="weightKg" value={form.weightKg} onChange={onChange} required />
                        </div>
                        <div>
                            <label>Costo (€)</label>
                            <input type="number" step="0.01" min="0" name="cost" value={form.cost} onChange={onChange} />
                        </div>
                    </div>

                    <div className="row">
                        <button type="submit" className="btn-8bit">+ Aggiungi Rotolo</button>
                    </div>
                    <div className="meta">
                        <span>Utente: <b>{data?.user?.name || data?.user?.email}</b></span>
                        <span>Ora locale: <b>{new Date().toLocaleString()}</b></span>
                    </div>
                </form>
            </div>

            {/* LISTA ELEMENTI */}
            <div className="list">
                {loading ? (
                    <div className="loading">Caricamento…</div>
                ) : items.length === 0 ? (
                    <div className="empty">Nessun rotolo presente.</div>
                ) : (
                    items.map((it) => (
                        <article className="card-8bit" key={it._id}>
                            <header className="card-head">
                                <span className="chip" data-color={it.color}></span>
                                <h3>{it.material} • {it.brand}</h3>
                            </header>
                            <div className="card-body">
                                <div><b>Colore:</b> {it.color}</div>
                                <div><b>Peso:</b> {Number(it.weightKg).toFixed(2)} kg</div>
                                <div><b>Costo:</b> € {Number(it.cost || 0).toFixed(2)}</div>
                            </div>
                            <footer className="card-foot">
                                <span className="by">Inserito da: {it.user || '-'}</span>
                                <span className="ts">{it.createdAt ? new Date(it.createdAt).toLocaleString() : ''}</span>
                            </footer>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}
