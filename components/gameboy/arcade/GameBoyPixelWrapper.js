"use client";
import React, { useEffect, useRef } from "react";
import { EventBus, GBInput } from "../GameBoyToolWrapper";

/**
 * Palette predefinite (DMG classico + grigio 4 livelli).
 * Le palette sono usate in modalità "indexed" (2/4/8 bpp).
 */
export const Palettes = {
    DMG: new Uint8Array([
        15, 56, 15, 255,
        48, 98, 48, 255,
        139, 172, 15, 255,
        155, 188, 15, 255,
    ]),
    GRAY4: new Uint8Array([
        0, 0, 0, 255,
        85, 85, 85, 255,
        170, 170, 170, 255,
        255, 255, 255, 255,
    ]),
};

// -----------------------------------------------------------------------------
// Utility piccole
// -----------------------------------------------------------------------------
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
function hexToRGBABytes(hex) {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return [r, g, b, 255];
}
function makePaletteBytes(pal, expectedSize) {
    // Restituisce una palette RGBA (Uint8Array) di length expectedSize*4
    const out = new Uint8Array(expectedSize * 4);
    if (pal instanceof Uint8Array) {
        out.set(pal.slice(0, expectedSize * 4));
        return out;
    }
    for (let i = 0; i < expectedSize; i++) {
        const [r, g, b, a] = hexToRGBABytes(pal && pal[i] ? pal[i] : "#000000");
        const o = i * 4;
        out[o + 0] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = a;
    }
    return out;
}

// -----------------------------------------------------------------------------
// PixelWrapper: cartuccia “engine” che disegna su canvas e gestisce:
// - buffer pixel (indexed/rgb565/rgba8888)
// - palette
// - game loop a timestep fisso
// - coda input
// - HUD a tempo (box verdi) e 2 menu (gioco con Start, impostazioni con Select)
// - API per la logica (giochi)
// -----------------------------------------------------------------------------
export class PixelWrapper {
    constructor(opts = {}) {
        // --- configurazione base / “scocca” della cartuccia
        this.label = opts.label ?? "Mini Engine";
        this.image = opts.image ?? "/pixel-cart.svg";

        // Risoluzione e limiti “GB-like”
        const width = opts.width ?? 160;
        const height = opts.height ?? 144;
        this.clampToGB = opts.clampToGB ?? true;
        const minW = 80, minH = 72, maxW = 320, maxH = 288;
        this.width  = this.clampToGB ? clamp(width,  minW, maxW)  : width;
        this.height = this.clampToGB ? clamp(height, minH, maxH) : height;

        // Modalità colore
        this.mode = opts.mode ?? "indexed"; // "indexed" | "rgb565" | "rgba8888"
        this.bpp  = opts.bpp  ?? (this.mode === "indexed" ? 2 : this.mode === "rgb565" ? 16 : 32);

        // Framerate/timestep fisso
        this.fps = this.clampToGB ? clamp((opts.fps ?? 59.7), 10, 120) : (opts.fps ?? 60);
        this._stepMs = 1000 / this.fps;

        // Auto-start: se true, il loop parte quando il canvas viene montato
        this.autoStart = opts.autoStart ?? true;

        // Bus eventi: _update → trigger re-render React nel Core, bus → eventi generici (“frame”, “notify”, …)
        this._update = new EventBus();
        this.bus = new EventBus();

        // Stato loop
        this._running = false; // il loop rAF è attivo?
        this._paused  = false; // pausa logica (menu aperto)?
        this._lastT = 0;
        this._accum = 0;
        this._raf = null;

        // Input
        this._inputQueue = [];   // eventi impulsi
        this._buttonsDown = new Set(); // se vuoi estendere per “held”

        // HUD (box verdi) – visibile solo per un po’ quando richiesto
        this._hudVisible = false;
        this._hudTimer = null;
        this._HUD_MS = opts.hudMs ?? 2200; // durata overlay info

        // Menu: stato comune a Game Menu (Start) e Settings Menu (Select)
        this._menu = {
            open: false,
            kind: null,           // "game" | "settings"
            title: "",
            items: [],            // [{label, value, rightLabel?}]
            cursor: 0,
            onSelect: null,       // fn(value, api) → "close" | "stay" (default "close")
            onOpen: null,         // fn(api)
            onClose: null,        // fn(api)
        };

        // Definizione menu di gioco fornita dalla logica (tramite API)
        this._gameMenuDef = {
            title: this.label,
            items: [ { label: "Resume", value: "resume" } ],
            onSelect: (value) => (value === "resume" ? "close" : "close"),
            onOpen: null,
            onClose: null,
        };

        // Palette (solo per indexed)
        if (this.mode === "indexed") {
            const paletteSize = 1 << this.bpp; // 4,16,256
            this.palette = opts.palette
                ? makePaletteBytes(opts.palette, paletteSize)
                : (this.bpp === 2
                    ? Palettes.DMG
                    : makePaletteBytes(["#000000", "#FFFFFF"], paletteSize));
        } else {
            this.palette = new Uint8Array(0);
        }

        // Buffer pixel (un solo buffer attivo in base alla modalità)
        this._allocBuffers();

        // Logica/gioco plug‑in (set con attachLogic)
        this._logic = null;

        // --- API esposta alla logica (giochi) ---
        this._api = {
            // dimensioni & ambiente
            width: this.width,
            height: this.height,
            mode: this.mode,
            bpp: this.bpp,
            timeMs: () => performance.now(),

            // accesso al buffer raw (utile per operazioni massicce)
            getBuffer: () => this.bufIndexed || this.buf565 || this.bufRGBA,

            // scrittura high level per pixel
            writeIndex: (x, y, idx) => {
                if (!this.bufIndexed) return;
                if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
                this.bufIndexed[y * this.width + x] = idx & ((1 << this.bpp) - 1);
            },
            write565: (x, y, rgb565) => {
                if (!this.buf565) return;
                if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
                this.buf565[y * this.width + x] = rgb565 & 0xffff;
            },
            writeRGBA: (x, y, r, g, b, a = 255) => {
                if (!this.bufRGBA) return;
                if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
                const o = (y * this.width + x) * 4;
                this.bufRGBA[o + 0] = r; this.bufRGBA[o + 1] = g;
                this.bufRGBA[o + 2] = b; this.bufRGBA[o + 3] = a;
            },

            // riempimenti rapidi
            fillIndex: (idx) => { if (this.bufIndexed) this.bufIndexed.fill(idx & ((1 << this.bpp) - 1)); },
            fill565:   (v)   => { if (this.buf565)   this.buf565.fill(v & 0xffff); },
            fillRGBA:  (r, g, b, a = 255) => {
                if (!this.bufRGBA) return;
                const d = this.bufRGBA;
                for (let i = 0; i < d.length; i += 4) { d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = a; }
            },

            // palette (solo indexed)
            setPalette: (bytes) => { if (this.mode === "indexed") this.palette = bytes; },
            getPalette: () => this.palette,

            // eventi utili verso host (debug/log)
            present: () => { this.bus.emit("frame", { t: performance.now() }); },
            emit: (name, payload) => { this.bus.emit(name, payload); },

            // --- aggancio MENU GIOCO ---
            /**
             * La logica registra qui il proprio menu di gioco (aperto con START):
             *  api.configureGameMenu({
             *    title: "Pong",
             *    items: [{label:"Resume", value:"resume"}, {label:"Restart", value:"restart"}],
             *    onSelect: (value, api) => { ...; return "close"|"stay"; },
             *    onOpen:   (api) => {},
             *    onClose:  (api) => {},
             *  })
             */
            configureGameMenu: (def) => {
                this._gameMenuDef = {
                    title: def?.title ?? this.label,
                    items: Array.isArray(def?.items) && def.items.length ? def.items : [{ label: "Resume", value: "resume" }],
                    onSelect: typeof def?.onSelect === "function" ? def.onSelect : (v)=>"close",
                    onOpen:   typeof def?.onOpen   === "function" ? def.onOpen   : null,
                    onClose:  typeof def?.onClose  === "function" ? def.onClose  : null,
                };
            },
        };
    }

    // Alloca il buffer attivo in base alla modalità colore scelta
    _allocBuffers() {
        const N = this.width * this.height;
        this.bufIndexed = undefined;
        this.buf565 = undefined;
        this.bufRGBA = undefined;

        if (this.mode === "indexed") {
            this.bufIndexed = new Uint8Array(N);
        } else if (this.mode === "rgb565") {
            this.buf565 = new Uint16Array(N);
        } else {
            this.bufRGBA = new Uint8ClampedArray(N * 4);
        }
    }

    // --- interfaccia compatibile con le tue cassette (wiring col Core) ---
    subscribe(cb) { return this._update.on("update", cb); }
    _notify() { this._update.emit("update", { version: Date.now() }); }
    on(name, fn) { return this.bus.on(name, fn); }
    off(name, fn) { return this.bus.off(name, fn); }
    emit(name, payload) { return this.bus.emit(name, payload); }

    // ---------------------------------------------------------------------------
    // Gestione input dal Core:
    // - se un menu è aperto, gli input navigano il menu
    // - START apre/chiude il Game Menu
    // - SELECT apre/chiude il Settings Menu
    // - altrimenti gli input vanno in coda alla logica
    // ---------------------------------------------------------------------------
    handleInput(name) {
        const now = performance.now();

        // 1) Se il menu è aperto: naviga/gestisci menu e NON inoltrare alla logica
        if (this._menu.open) {
            const len = this._menu.items.length || 0;
            if (name === GBInput.UP)   { this._menu.cursor = (this._menu.cursor + len - 1) % len; this._notify(); return; }
            if (name === GBInput.DOWN) { this._menu.cursor = (this._menu.cursor + 1) % len;      this._notify(); return; }
            if (name === GBInput.B || name === GBInput.START || name === GBInput.SELECT) {
                this._closeMenu(); return;
            }
            if (name === GBInput.A) {
                const sel = this._menu.items[this._menu.cursor];
                const next = this._menu.onSelect ? this._menu.onSelect(sel?.value, this._api) : "close";
                if (next !== "stay") this._closeMenu();
                return;
            }
            return;
        }

        // 2) Gestione tasti “di sistema” (Start → Game Menu, Select → Settings)
        if (name === GBInput.START)  { this._openGameMenu(); return; }
        if (name === GBInput.SELECT) { this._openSettingsMenu(); return; }

        // 3) Altrimenti: accumula input e inoltra alla logica nel prossimo update
        this._inputQueue.push({ name, t: now });
        this._buttonsDown.add(name);
    }

    // --- API usate dal Settings Menu ---
    _resetGame() {
        // Se la logica implementa reset(api), usiamola; altrimenti reset grafico grezzo
        if (this._logic && typeof this._logic.reset === "function") {
            this._logic.reset(this._api);
        } else {
            // fallback: pulisco i buffer
            if (this.bufIndexed) this.bufIndexed.fill(0);
            if (this.buf565) this.buf565.fill(0);
            if (this.bufRGBA) this.bufRGBA.fill(0);
        }
        this.bus.emit("notify", { message: "Game reset" });
    }
    _showHUD(ms = this._HUD_MS) {
        this._hudVisible = true;
        this._notify();
        if (this._hudTimer) clearTimeout(this._hudTimer);
        this._hudTimer = setTimeout(() => {
            this._hudVisible = false;
            this._hudTimer = null;
            this._notify();
        }, ms);
    }

    // --- Menù: apertura/chiusura
    _openGameMenu() {
        const def = this._gameMenuDef || {};
        this._menu = {
            open: true,
            kind: "game",
            title: def.title || this.label,
            items: def.items || [{ label: "Resume", value: "resume" }],
            cursor: 0,
            onSelect: (value, api) => {
                if (typeof def.onSelect === "function") return def.onSelect(value, api);
                return "close";
            },
            onOpen: def.onOpen || null,
            onClose: def.onClose || null,
        };
        this._paused = true;
        if (this._menu.onOpen) this._menu.onOpen(this._api);
        this._notify();
    }
    _openSettingsMenu() {
        // Menu impostazioni “di sistema”
        this._menu = {
            open: true,
            kind: "settings",
            title: "Impostazioni",
            items: [
                { label: "Reset gioco",   value: "reset" },
                { label: "Mostra info",   value: "info"  },
                { label: "Chiudi",        value: "close" },
            ],
            cursor: 0,
            onSelect: (value) => {
                if (value === "reset") { this._resetGame(); return "close"; }
                if (value === "info")  { this._showHUD();  return "close"; }
                return "close";
            },
            onOpen: null,
            onClose: null,
        };
        this._paused = true;
        this._notify();
    }
    _closeMenu() {
        const was = this._menu;
        this._menu.open = false;
        this._menu.kind = null;
        this._menu.items = [];
        this._menu.cursor = 0;
        this._paused = false;
        if (was.onClose) was.onClose(this._api);
        this._notify();
    }

    // --- life‑cycle del loop ---
    attachLogic(logic) {
        // collega/inizializza la logica del gioco
        this._logic = logic || null;
        this._api.width = this.width;
        this._api.height = this.height;
        this._api.mode = this.mode;
        this._api.bpp = this.bpp;
        if (this._logic && typeof this._logic.init === "function") {
            this._logic.init(this._api);
        }
    }
    start() {
        if (this._running) return;
        this._running = true;
        this._lastT = performance.now();
        this._accum = 0;
        this._loop();
        // mostra HUD per qualche secondo all’avvio, poi sparisce
        this._showHUD();
        this.bus.emit("notify", { message: "Engine started" });
        this._notify();
    }
    stop() {
        this._running = false;
        if (this._raf != null) { cancelAnimationFrame(this._raf); this._raf = null; }
        this.bus.emit("notify", { message: "Engine stopped" });
        this._notify();
    }

    setFps(fps) {
        this.fps = this.clampToGB ? clamp(fps, 10, 120) : fps;
        this._stepMs = 1000 / this.fps;
    }
    setResolution(w, h) {
        this.width  = this.clampToGB ? clamp(w, 80, 320) : w;
        this.height = this.clampToGB ? clamp(h, 72, 288) : h;
        this._allocBuffers();
        this._api.width = this.width;
        this._api.height = this.height;
        this.bus.emit("notify", { message: `Resolution ${this.width}x${this.height}` });
        this._notify();
    }
    setColorMode(mode, bpp, palette) {
        this.mode = mode;
        this.bpp = (bpp != null ? bpp : (mode === "indexed" ? 2 : mode === "rgb565" ? 16 : 32));
        if (mode === "indexed") {
            const size = 1 << this.bpp;
            this.palette = palette ? makePaletteBytes(palette, size)
                : (this.bpp === 2 ? Palettes.DMG : makePaletteBytes(["#000000", "#FFFFFF"], size));
        } else {
            this.palette = new Uint8Array(0);
        }
        this._allocBuffers();
        this._api.mode = this.mode;
        this._api.bpp = this.bpp;
        this.bus.emit("notify", { message: `Color mode: ${mode} ${this.bpp}bpp` });
        this._notify();
    }

    // Game loop con timestep fisso: se in pausa (menu), non chiama update della logica
    _loop = () => {
        if (!this._running) return;
        const now = performance.now();
        let dt = now - this._lastT;
        if (dt > 250) dt = this._stepMs; // evitare salti enormi al rientro dal background
        this._lastT = now;
        this._accum += dt;

        while (this._accum >= this._stepMs) {
            if (!this._paused && this._logic && typeof this._logic.update === "function") {
                const q = this._inputQueue.splice(0, this._inputQueue.length); // svuota coda input
                this._logic.update(this._stepMs, q, this._api);                // step logico
            } else {
                // se in pausa, scarta eventuali input accumulati (evita code degenerate)
                this._inputQueue.length = 0;
            }
            this._accum -= this._stepMs;
        }

        // segnala frame pronto (anche se in pausa: serve a ridisegnare HUD/menu)
        this.bus.emit("frame", { t: now });
        this._raf = requestAnimationFrame(this._loop);
    };

    // Converte il buffer interno in RGBA per mettere i pixel sul canvas
    presentToRGBA(dest) {
        if (this.mode === "rgba8888" && this.bufRGBA) {
            dest.set(this.bufRGBA);
            return;
        }
        if (this.mode === "indexed" && this.bufIndexed) {
            const pal = this.palette;
            const src = this.bufIndexed;
            let di = 0;
            const mask = (1 << this.bpp) - 1;
            for (let i = 0; i < src.length; i++) {
                const p = (src[i] & mask) * 4;
                dest[di++] = pal[p + 0];
                dest[di++] = pal[p + 1];
                dest[di++] = pal[p + 2];
                dest[di++] = pal[p + 3];
            }
            return;
        }
        if (this.mode === "rgb565" && this.buf565) {
            const src = this.buf565;
            let di = 0;
            for (let i = 0; i < src.length; i++) {
                const v = src[i];
                const r = ((v >> 11) & 0x1f) * 255 / 31;
                const g = ((v >> 5)  & 0x3f) * 255 / 63;
                const b = ( v        & 0x1f) * 255 / 31;
                dest[di++] = r; dest[di++] = g; dest[di++] = b; dest[di++] = 255;
            }
        }
    }

    // ---------------------------------------------------------------------------
    // RENDER: canvas + HUD temporaneo + (se aperto) overlay del menu
    // ---------------------------------------------------------------------------
    render() {
        return (
            <div className="gb-screen__pixel" style={{ position: "relative" }}>
                {/* Viewport pixel */}
                <PixelScreen w={this.width} h={this.height} wrapper={this} />

                {/* HUD temporaneo: compare all'avvio o quando richiesto, poi scompare */}
                {this._hudVisible && (
                    <>
                        {/* Titolo in alto a sinistra (riuso classe esistente) */}
                        <div className="gb-name">{this.label}</div>

                        {/* Controlli in basso a sinistra */}
                        <div className="gb-footer-hint" style={{ left: "0.5rem" }}>
                            <span>↑↓←→: muovi • A/B: azione</span>
                            <span>Start: menu • Select: impostazioni</span>
                        </div>

                        {/* Info tecniche in basso a destra */}
                        <div
                            className="gb-footer-hint"
                            style={{ left: "auto", right: "0.5rem" }}
                        >
                            <span>{`${this.width}×${this.height} • ${this.mode} ${this.bpp}bpp`}</span>
                            <span>{`${this.fps.toFixed(1)} fps`}</span>
                        </div>
                    </>
                )}

                {/* Menu overlay (game/settings) */}
                {this._menu.open && (
                    <MenuOverlay
                        title={this._menu.title || (this._menu.kind === "game" ? "Menu" : "Impostazioni")}
                        items={this._menu.items}
                        cursor={this._menu.cursor}
                    />
                )}
            </div>
        );
    }
}

/**
 * Canvas viewer che copia i pixel del buffer nel canvas ad ogni "frame".
 * - Tiene un ImageData della dimensione corrente.
 * - rAF lo gestisce il wrapper; qui ascoltiamo solo "frame" e facciamo putImageData.
 * - Avvio/stop: se autoStart è true, partiamo al mount e stop al cleanup.
 */
function PixelScreen({ w, h, wrapper }) {
    const ref = useRef(null);
    const imageDataRef = useRef(null);
    const ctxRef = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;
        ctxRef.current = ctx;
        ctx.imageSmoothingEnabled = false;

        // crea un ImageData della dimensione corrente
        canvas.width = w;
        canvas.height = h;
        imageDataRef.current = ctx.createImageData(wrapper.width, wrapper.height);

        // redisegna a ogni "frame" del wrapper
        const offFrame = wrapper.on("frame", () => {
            const id = imageDataRef.current;
            if (!id) return;
            wrapper.presentToRGBA(id.data);
            ctx.putImageData(id, 0, 0);
        });

        // se cambia risoluzione, ricrea ImageData
        const offUpdate = wrapper.subscribe(() => {
            const c = ctxRef.current;
            if (!c) return;
            canvas.width = wrapper.width;
            canvas.height = wrapper.height;
            c.imageSmoothingEnabled = false;
            imageDataRef.current = c.createImageData(wrapper.width, wrapper.height);
        });

        if (wrapper.autoStart) wrapper.start();

        return () => {
            offFrame && offFrame();
            offUpdate && offUpdate();
            wrapper.stop();
        };
    }, [w, h, wrapper]);

    return (
        <canvas
            ref={ref}
            width={w}
            height={h}
            style={{ width: "100%", height: "100%", imageRendering: "pixelated" }}
            aria-label="Pixel renderer"
        />
    );
}

/**
 * Overlay del menu: reso indipendente dal CSS esterno grazie a un minimo di inline style.
 * - Mostra titolo e lista voci.
 * - L'evidenziazione della voce selezionata è basata su index (cursor).
 */
function MenuOverlay({ title, items, cursor }) {
    return (
        <div
            className="gb-menu"
            aria-label="menu"
            style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                background: "rgba(0,0,0,0.25)",
                pointerEvents: "none", // l'input passa al wrapper; qui solo visual
            }}
        >
            <div
                style={{
                    pointerEvents: "none",
                    minWidth: "70%",
                    maxWidth: "90%",
                    background: "#cfe69b",   // verdino “LCD”
                    border: "2px solid #4c8b2b",
                    color: "#0b2a0b",
                    padding: "8px 10px",
                    boxShadow: "0 2px 0 #305c1a, inset 0 0 0 1px rgba(0,0,0,0.15)",
                    fontFamily: "monospace",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: "bold",
                        marginBottom: 6,
                    }}
                >
                    <span>{title}</span>
                    <span style={{ opacity: 0.7 }}>↑↓ seleziona • A conferma • B/Start chiudi</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {items.map((it, i) => (
                        <li
                            key={i}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "2px 4px",
                                margin: "1px 0",
                                background: i === cursor ? "#a7cb66" : "transparent",
                                borderRadius: 2,
                            }}
                        >
                            <span>{it.label}</span>
                            <span style={{ opacity: 0.6 }}>{it.rightLabel || ""}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
