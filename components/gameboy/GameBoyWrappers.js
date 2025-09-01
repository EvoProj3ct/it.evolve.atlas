"use client";
import React from "react";
import Image from "next/image";

// -------------------------------------------------------------
// Wrapper multipagina: il wrapper contiene TUTTE le pagine della cassetta
// e SA renderizzarle (il Core non conosce più i tipi).
// -------------------------------------------------------------

export const GBType = {
    IMAGE: "IMAGE",
    TEXT: "TEXT",
    VIDEO: "VIDEO",
    LINK: "LINK",
};

export const GBInput = {
    UP: "UP",
    DOWN: "DOWN",
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    A: "A",
    B: "B",
    START: "START",
    SELECT: "SELECT",
};

// --- EventBus (pub/sub) ---
export class EventBus {
    constructor() {
        this.listeners = new Map(); // name -> Set<fn>
    }
    on(name, fn) {
        if (!this.listeners.has(name)) this.listeners.set(name, new Set());
        this.listeners.get(name).add(fn);
        return () => this.off(name, fn);
    }
    off(name, fn) {
        const set = this.listeners.get(name);
        if (!set) return;
        set.delete(fn);
    }
    emit(name, payload) {
        const set = this.listeners.get(name);
        if (!set) return;
        for (const fn of set) {
            try { fn(payload); } catch {}
        }
    }
}

// -------------------------------------------------------------
// BaseCassette: gestione pagine + stato per-pagina + eventi
// -------------------------------------------------------------
export class BaseCassette {
    constructor({ label, image, pages = [] } = {}) {
        this.label = label || "Cassette";
        this.image = image; // usata nel carosello
        this.pages = pages; // [{ type, props }]
        this.index = 0;     // pagina corrente

        this._version = 0;          // per trigger re-render nel Core
        this._update = new EventBus();
        this.bus = new EventBus();  // eventi custom verso host (open, seek, ...)

        // Stato per pagina (es. selected per LINK, playing per VIDEO)
        this._pageState = new Map(); // key = index -> obj
    }

    // --- wiring col Core
    subscribe(cb) { return this._update.on("update", cb); }
    _notify() { this._update.emit("update", { version: ++this._version }); }

    on(name, fn) { return this.bus.on(name, fn); }
    off(name, fn) { return this.bus.off(name, fn); }
    emit(name, payload) { this.bus.emit(name, payload); }

    // helper per stato-per-pagina
    _ps(i = this.index) {
        if (!this._pageState.has(i)) this._pageState.set(i, {});
        return this._pageState.get(i);
    }

    currentPage() { return this.pages[this.index]; }

    // Navigazione tra pagine
    prevPage() { this.index = Math.max(0, this.index - 1); this._notify(); }
    nextPage() { this.index = Math.min(this.pages.length - 1, this.index + 1); this._notify(); }

    // Gestione input generica + per-tipo
    handleInput(name) {
        const page = this.currentPage();
        if (!page) return;

        // LEFT/RIGHT: cambio pagina per default
        if (name === GBInput.LEFT) return this.prevPage();
        if (name === GBInput.RIGHT) return this.nextPage();

        // Per tipo specifico
        switch (page.type) {
            case GBType.LINK: {
                const st = this._ps();
                const items = page.props?.items || [];
                st.selected = Math.max(0, Math.min((items.length || 1) - 1, st.selected ?? 0));
                if (name === GBInput.UP)   st.selected = Math.max(0, st.selected - 1);
                if (name === GBInput.DOWN) st.selected = Math.min(items.length - 1, st.selected + 1);
                if (name === GBInput.A) {
                    const it = items[st.selected];
                    if (it?.href) this.emit("open", { href: it.href, label: it.label ?? it.href });
                }
                return this._notify();
            }
            case GBType.IMAGE: {
                // Esempio base: A = openImage (non essendoci galleria interna)
                if (name === GBInput.A) {
                    const { src } = page.props || {};
                    if (src) this.emit("openImage", { src, index: this.index });
                }
                return; // no notify necessario
            }
            case GBType.VIDEO: {
                const st = this._ps();
                st.playing = !!st.playing;
                if (name === GBInput.A) st.playing = !st.playing;
                if (name === GBInput.B) st.playing = false;
                if (name === GBInput.LEFT)  this.emit("seek", { delta: -5 });
                if (name === GBInput.RIGHT) this.emit("seek", { delta:  5 });
                return this._notify();
            }
            case GBType.TEXT: {
                // opzionale: offset, mono, ecc.
                const st = this._ps();
                st.offset = st.offset || 0;
                if (name === GBInput.UP)   st.offset = Math.max(0, st.offset - 1);
                if (name === GBInput.DOWN) st.offset = Math.min(9999, (st.offset || 0) + 1);
                if (name === GBInput.B)    st.offset = 0;
                return this._notify();
            }
        }
    }

    // --- RENDER: il wrapper costruisce l'HTML per la pagina corrente
    render() {
        const page = this.currentPage();
        if (!page) return <div className="gb-screen__empty">Inserisci una cassetta</div>;

        switch (page.type) {
            case GBType.IMAGE: {
                const { src, alt = "", fit = "contain" } = page.props || {};
                if (!src) return <div className="gb-screen__empty">Nessuna immagine</div>;
                return (
                    <div className="gb-screen__image" data-fit={fit}>
                        <Image src={src} alt={alt} fill sizes="(max-width: 600px) 100vw, 600px" />
                    </div>
                );
            }
            case GBType.TEXT: {
                const { content = "", mono = false } = page.props || {};
                return (
                    <div className="gb-screen__text" data-mono={mono ? "1" : "0"}>
                        <pre>{content}</pre>
                    </div>
                );
            }
            case GBType.VIDEO: {
                const st = this._ps();
                const { src, poster, loop = false } = page.props || {};
                if (!src) return <div className="gb-screen__empty">Nessun video</div>;
                return (
                    <div className="gb-screen__video">
                        <video src={src} poster={poster} controls autoPlay={!!st.playing} loop={loop} />
                    </div>
                );
            }
            case GBType.LINK: {
                const st = this._ps();
                const { items = [] } = page.props || {};
                const sel = Math.max(0, Math.min((items.length || 1) - 1, st.selected ?? 0));
                return (
                    <div className="gb-screen__links">
                        {items.length === 0 ? (
                            <div className="gb-screen__empty">Nessun link</div>
                        ) : (
                            <ul>
                                {items.map((it, i) => (
                                    <li key={i} data-selected={i === sel ? "1" : "0"}>
                                        <a href={it.href} target="_blank" rel="noreferrer">{it.label || it.href}</a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            }
            default:
                return <div className="gb-screen__empty">Pagina non supportata</div>;
        }
    }
}

// -------------------------------------------------------------
// Factory di esempio: crea una cassetta PROFILO a partire dai dati raw
// (nome, avatar, pagine: image/text/contacts)
// -------------------------------------------------------------
export function createProfileWrapper(member) {
    const pages = [];
    for (const p of member.pages || []) {
        if (p.type === "image") {
            pages.push({ type: GBType.IMAGE, props: { src: p.src || member.image, alt: member.name, fit: "contain" } });
        } else if (p.type === "text") {
            pages.push({ type: GBType.TEXT, props: { content: p.content || "", mono: false } });
        } else if (p.type === "contacts") {
            pages.push({ type: GBType.LINK, props: { items: (p.contacts || []).map(c => ({ href: c.href, label: c.label })) } });
        }
    }
    return new BaseCassette({ label: member.name, image: member.image, pages });
}
