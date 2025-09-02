"use client";
import React from "react";
import Image from "next/image";

// -------------------------------------------------------------
// Wrapper multipagina: contiene TUTTE le pagine della cassetta
// e SA renderizzarle (il Core non conosce i tipi).
// -------------------------------------------------------------

export const GBType = {
    IMAGE: "IMAGE",
    TEXT: "TEXT",
    LINK: "LINK",
    INPUTSTRING: "INPUTSTRING",
    INPUTNUMBER: "INPUTNUMBER",
    INPUTSELECTOR: "INPUTSELECTOR",
    INPUTEVENT: "INPUTEVENT",
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

        // Cache valori confermati
        this.cache = {};
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

    pageCount() { return this.pages.length; }
    currentPage() { return this.pages[this.index]; }

    // Navigazione tra pagine
    goTo(i) {
        const next = Math.max(0, Math.min(this.pages.length - 1, i));
        if (next !== this.index) {
            this.index = next;
            this.emit("seek", { index: this.index, total: this.pages.length });
            this._notify();
        }
    }
    prevPage() { this.goTo(this.index - 1); }
    nextPage() { this.goTo(this.index + 1); }

    // Cache helpers
    setCache(key, value) {
        if (!key) return;
        this.cache[key] = value;
        this.emit("change", { key, value, cache: { ...this.cache } });
    }
    getCache() { return { ...this.cache }; }

    // Digitazione diretta
    handleChar(ch) {
        const page = this.currentPage();
        if (!page) return;

        if (page.type === GBType.INPUTSTRING) {
            const st = this._ps();
            const {
                maxLength = 32,
                charset = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_@".split(""),
            } = page.props || {};

            if (typeof st.value !== "string") st.value = page.props?.value ?? "";
            if (typeof st.cursor !== "number") st.cursor = Math.min(st.value.length, maxLength - 1);

            let c = ch;
            if (c.length !== 1) return;
            c = c.toUpperCase();
            if (!charset.includes(c)) return;

            const arr = st.value.split("");
            arr[st.cursor] = c;
            st.value = arr.join("").slice(0, maxLength);
            st.cursor = Math.min(maxLength - 1, (st.cursor ?? 0) + 1);
            this._notify();
            return;
        }

        if (page.type === GBType.INPUTNUMBER) {
            const st = this._ps();
            const { min = -Infinity, max = Infinity } = page.props || {};
            if (typeof st.value !== "number") st.value = page.props?.value ?? 0;

            if (/[0-9]/.test(ch)) {
                const next = Number(String(st.value ?? 0) + ch);
                st.value = Math.max(min, Math.min(max, next));
                this._notify();
            } else if (ch === "-") {
                if (st.value === 0 || st.value === undefined || st.value === null) {
                    st.value = -0;
                    this._notify();
                }
            }
            return;
        }
    }

    handleSpecial(key) {
        const page = this.currentPage();
        if (!page) return;

        if (page.type === GBType.INPUTSTRING) {
            const st = this._ps();
            const maxLength = page.props?.maxLength ?? 32;
            if (typeof st.value !== "string") st.value = page.props?.value ?? "";
            if (typeof st.cursor !== "number") st.cursor = Math.min(st.value.length, maxLength - 1);

            if (key === "Backspace") {
                const arr = st.value.split("");
                arr.splice(st.cursor, 1);
                st.value = arr.join("");
                st.cursor = Math.max(0, (st.cursor ?? 0) - 1);
                this._notify();
            }
            if (key === "Delete") {
                const arr = st.value.split("");
                arr.splice(st.cursor, 1);
                st.value = arr.join("");
                this._notify();
            }
            return;
        }

        if (page.type === GBType.INPUTNUMBER) {
            const st = this._ps();
            if (key === "Backspace" || key === "Delete") {
                st.value = 0;
                this._notify();
            }
        }
    }

    // Gestione input generica + per-tipo (tasti del GameBoy)
    handleInput(name) {
        const page = this.currentPage();
        if (!page) return;

        const type = page.type;
        const isInputType =
            type === GBType.INPUTSTRING ||
            type === GBType.INPUTNUMBER ||
            type === GBType.INPUTSELECTOR ||
            type === GBType.INPUTEVENT;

        // LEFT/RIGHT: cambio pagina di default SOLO se non sono pagine di input
        if (!isInputType) {
            if (name === GBInput.LEFT) return this.prevPage();
            if (name === GBInput.RIGHT) return this.nextPage();
        }

        switch (type) {
            case GBType.LINK: {
                const st = this._ps();
                const items = page.props?.items || [];
                st.selected = Math.max(0, Math.min((items.length || 1) - 1, st.selected ?? 0));
                if (name === GBInput.UP)   st.selected = Math.max(0, st.selected - 1);
                if (name === GBInput.DOWN) st.selected = Math.min(items.length - 1, st.selected + 1);
                if (name === GBInput.A || name === GBInput.START) {
                    const it = items[st.selected];
                    if (it?.href) this.emit("open", { href: it.href, label: it.label ?? it.href });
                }
                if (name === GBInput.LEFT)  return this.prevPage();
                if (name === GBInput.RIGHT) return this.nextPage();
                return this._notify();
            }

            case GBType.IMAGE: {
                if (name === GBInput.A || name === GBInput.START) {
                    const { src } = page.props || {};
                    if (src) this.emit("openImage", { src, index: this.index });
                }
                if (name === GBInput.LEFT)  return this.prevPage();
                if (name === GBInput.RIGHT) return this.nextPage();
                return;
            }

            case GBType.TEXT: {
                const st = this._ps();
                st.offset = st.offset || 0;
                if (name === GBInput.UP)   st.offset = Math.max(0, st.offset - 1);
                if (name === GBInput.DOWN) st.offset = Math.min(9999, (st.offset || 0) + 1);
                if (name === GBInput.B)    st.offset = 0;
                if (name === GBInput.LEFT)  return this.prevPage();
                if (name === GBInput.RIGHT) return this.nextPage();
                return this._notify();
            }

            // ---------- INPUTSTRING ----------
            case GBType.INPUTSTRING: {
                const st = this._ps();
                const {
                    value: initial = "",
                    maxLength = 32,
                    charset = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_@".split(""),
                    onChange,
                    onCancel,
                    autoNext = true,
                    autoBack = false,
                    clearOnB = false,
                    cacheKey,
                } = page.props || {};

                if (typeof st.value !== "string") st.value = initial;
                if (typeof st.cursor !== "number") st.cursor = Math.min(st.value.length, maxLength - 1);

                const charIndex = () => {
                    const ch = st.value[st.cursor] ?? " ";
                    const idx = charset.indexOf(ch);
                    return idx >= 0 ? idx : 0;
                };

                if (name === GBInput.LEFT)  st.cursor = Math.max(0, st.cursor - 1);
                if (name === GBInput.RIGHT) st.cursor = Math.min(maxLength - 1, st.cursor + 1);

                if (name === GBInput.UP || name === GBInput.DOWN) {
                    let idx = charIndex();
                    idx += name === GBInput.UP ? 1 : -1;
                    if (idx < 0) idx = charset.length - 1;
                    if (idx >= charset.length) idx = 0;
                    const arr = st.value.split("");
                    arr[st.cursor] = charset[idx];
                    st.value = arr.join("").slice(0, maxLength);
                }

                if (name === GBInput.A || name === GBInput.START) {
                    if (cacheKey) this.setCache(cacheKey, st.value);
                    if (typeof onChange === "function") onChange(st.value, this.getCache());
                    this.emit("notify", { message: "String updated", value: st.value, index: this.index });
                    if (autoNext) return this.nextPage();
                }

                if (name === GBInput.B || name === GBInput.SELECT) {
                    if (clearOnB) { st.value = ""; st.cursor = 0; }
                    if (typeof onCancel === "function") onCancel(st.value, this.getCache());
                    this.emit("back", { index: this.index, value: st.value });
                    if (autoBack) return this.prevPage();
                }

                return this._notify();
            }

            // ---------- INPUTNUMBER ----------
            case GBType.INPUTNUMBER: {
                const st = this._ps();
                const {
                    value: initial = 0, min = -Infinity, max = Infinity, step = 1,
                    onChange, onCancel, autoNext = true, autoBack = false, resetOnB = true,
                    cacheKey,
                } = page.props || {};
                if (typeof st.value !== "number") st.value = initial;
                const clamp = (v) => Math.min(max, Math.max(min, v));

                if (name === GBInput.UP)   st.value = clamp(st.value + step);
                if (name === GBInput.DOWN) st.value = clamp(st.value - step);

                if (name === GBInput.A || name === GBInput.START) {
                    if (cacheKey) this.setCache(cacheKey, st.value);
                    if (typeof onChange === "function") onChange(st.value, this.getCache());
                    this.emit("notify", { message: "Number updated", value: st.value, index: this.index });
                    if (autoNext) return this.nextPage();
                }

                if (name === GBInput.B || name === GBInput.SELECT) {
                    if (resetOnB) st.value = initial;
                    if (typeof onCancel === "function") onCancel(st.value, this.getCache());
                    this.emit("back", { index: this.index, value: st.value });
                    if (autoBack) return this.prevPage();
                }

                return this._notify();
            }

            // ---------- INPUTSELECTOR ----------
            case GBType.INPUTSELECTOR: {
                const st = this._ps();
                const {
                    options = [],
                    selected = 0, onChange, onCancel, autoNext = true, autoBack = false,
                    cacheKey,
                } = page.props || {};

                st.index = Math.max(0, Math.min(options.length - 1, st.index ?? selected ?? 0));

                if (name === GBInput.UP)   st.index = Math.max(0, st.index - 1);
                if (name === GBInput.DOWN) st.index = Math.min(options.length - 1, st.index + 1);

                if (name === GBInput.A || name === GBInput.START) {
                    const choice = options[st.index];
                    const value = typeof choice === "object" ? (choice.value ?? choice.label) : choice;
                    if (cacheKey) this.setCache(cacheKey, value);
                    if (typeof onChange === "function") onChange(value, this.getCache());
                    this.emit("notify", { message: "Selection updated", value, index: this.index });
                    if (autoNext) return this.nextPage();
                }

                if (name === GBInput.B || name === GBInput.SELECT) {
                    if (typeof onCancel === "function") onCancel(st.index, this.getCache());
                    this.emit("back", { index: this.index });
                    if (autoBack) return this.prevPage();
                }

                return this._notify();
            }

            // ---------- INPUTEVENT ----------
            case GBType.INPUTEVENT: {
                const p = page.props || {};
                const map = {
                    [GBInput.UP]: p.onUp,
                    [GBInput.DOWN]: p.onDown,
                    [GBInput.LEFT]: p.onLeft,
                    [GBInput.RIGHT]: p.onRight,
                    [GBInput.A]: p.onA,
                    [GBInput.B]: p.onB,
                    [GBInput.START]: p.onStart,
                    [GBInput.SELECT]: p.onSelect,
                };
                const fn = map[name];
                if (typeof fn === "function") fn({ index: this.index, page, cache: this.getCache() });
                this.emit("notify", { message: "Event fired", input: name, index: this.index });
                if ((name === GBInput.A || name === GBInput.START) && !p.onA && !p.onStart) {
                    this.emit("notify", { message: "Cache dump", cache: this.getCache(), index: this.index });
                }
                if (p.autoNext && (name === GBInput.A || name === GBInput.START)) return this.nextPage();
                return;
            }

            default:
                return;
        }
    }

    // --- RENDER: il wrapper costruisce l'HTML per la pagina corrente
    render() {
        const page = this.currentPage();
        if (!page) return <div className="gb-screen__empty">Inserisci una cassetta</div>;

        const Overlays = ({ footer }) => (
            <>
                <div className="gb-name">{page.props?.title ?? this.label}</div>
                <div className="gb-footer-hint">
                    <span>{footer}</span>
                    <span>{page.props?.hint ?? ""}</span>
                </div>
                <div className="gb-page-ind">{this.index + 1}/{this.pages.length}</div>
            </>
        );

        switch (page.type) {
            case GBType.IMAGE: {
                const { src, alt = "", fit = "contain" } = page.props || {};
                if (!src) return <div className="gb-screen__empty">Nessuna immagine</div>;
                return (
                    <div className="gb-screen__image" data-fit={fit}>
                        <Image src={src} alt={alt} fill sizes="(max-width: 600px) 100vw, 600px" />
                        <Overlays footer="A: apri • ←→: pagina" />
                    </div>
                );
            }

            case GBType.TEXT: {
                const { content = "", mono = false } = page.props || {};
                return (
                    <div className="gb-screen__text" data-mono={mono ? "1" : "0"}>
                        <pre>{content}</pre>
                        <Overlays footer="↑↓: scorri • B: reset • ←→: pagina" />
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
                        <Overlays footer="↑↓: seleziona • A: apri • ←→: pagina" />
                    </div>
                );
            }

            case GBType.INPUTSTRING: {
                const st = this._ps();
                const { placeholder = "" } = page.props || {};
                const value = (typeof st.value === "string" ? st.value : (page.props?.value ?? ""));
                const cursor = Math.max(0, Math.min((page.props?.maxLength ?? 32) - 1, st.cursor ?? value.length));
                const visual =
                    value.slice(0, cursor) + (value[cursor] ?? " ") + value.slice(cursor + 1);
                return (
                    <div className="gb-screen__text" data-mono="1">
                        <pre>
{`> ${visual || placeholder}
A: OK   B: Annulla
↑↓: Carattere   ←→: Posizione`}
                        </pre>
                        <Overlays footer="Input testo" />
                    </div>
                );
            }

            case GBType.INPUTNUMBER: {
                const st = this._ps();
                const val = typeof st.value === "number" ? st.value : (page.props?.value ?? 0);
                return (
                    <div className="gb-screen__text" data-mono="1">
                        <pre>
{`Valore: ${val}
↑: +   ↓: -   A: OK   B: Reset`}
                        </pre>
                        <Overlays footer="Selettore numerico" />
                    </div>
                );
            }

            case GBType.INPUTSELECTOR: {
                const st = this._ps();
                const { options = [] } = page.props || {};
                const idx = Math.max(0, Math.min(options.length - 1, st.index ?? (page.props?.selected ?? 0)));
                return (
                    <div className="gb-screen__links">
                        {options.length === 0 ? (
                            <div className="gb-screen__empty">Nessuna opzione</div>
                        ) : (
                            <ul>
                                {options.map((opt, i) => {
                                    const label = typeof opt === "object" ? (opt.label ?? String(opt.value)) : String(opt);
                                    return (
                                        <li key={i} data-selected={i === idx ? "1" : "0"}>
                                            <span>{label}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        <Overlays footer="↑↓: seleziona • A: OK • B: indietro" />
                    </div>
                );
            }

            case GBType.INPUTEVENT: {
                return (
                    <div className="gb-screen__text" data-mono="1">
                        <pre>
{`Premi A/Start per confermare
B/Select per tornare indietro`}
                        </pre>
                        <Overlays footer="Handler di eventi" />
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
// (nome, avatar, pagine: image/text/contacts + input)
// -------------------------------------------------------------
export function makeCassette(member) {
    const pages = [];
    for (const p of member.pages || []) {
        if (p.type === "image") {
            pages.push({ type: GBType.IMAGE, props: { src: p.src || member.image, alt: member.name, fit: "contain" } });
        } else if (p.type === "text") {
            pages.push({ type: GBType.TEXT, props: { content: p.content || "", mono: false } });
        } else if (p.type === "contacts") {
            pages.push({ type: GBType.LINK, props: { items: (p.contacts || []).map(c => ({ href: c.href, label: c.label })) } });
        } else if (p.type === "selector") {
            pages.push({ type: GBType.INPUTSELECTOR, props: { options: p.options || [], cacheKey: p.cacheKey || `selector_${pages.length}`, autoNext: p.autoNext ?? true } });
        } else if (p.type === "number") {
            pages.push({ type: GBType.INPUTNUMBER, props: { value: p.value ?? 0, min: p.min, max: p.max, step: p.step ?? 1, cacheKey: p.cacheKey || `number_${pages.length}`, autoNext: p.autoNext ?? true } });
        } else if (p.type === "string") {
            pages.push({ type: GBType.INPUTSTRING, props: { value: p.value ?? "", maxLength: p.maxLength ?? 32, cacheKey: p.cacheKey || `string_${pages.length}`, autoNext: p.autoNext ?? true } });
        } else if (p.type === "inputevent") {
            pages.push({ type: GBType.INPUTEVENT, props: p.props || {} });
        }
    }
    return new BaseCassette({ label: member.name, image: member.image, pages });
}
