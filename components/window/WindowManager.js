"use client";

import React, { createContext, useContext, useReducer, useMemo, useCallback } from "react";
import styles from "./WindowsStyles.module.css";

/**
 * Stato per ogni finestra:
 *  - pinned:     barra visibile e card “zoomata”
 *  - minimized:  nascosta e presente nella tray
 *  - closed:     nascosta, NON presente nella tray
 *  - iconPos:    posizione icona minimizzata { x, y }
 */
const initialState = { byId: {} };

function ensure(state, id, title) {
    const existing = state.byId[id];
    if (existing) {
        if (title && title !== existing.title) return { ...existing, title };
        return existing;
    }
    return { id, title: title || id, pinned: false, minimized: false, closed: false, iconPos: null };
}

function reducer(state, action) {
    switch (action.type) {
        case "REGISTER": {
            const w = ensure(state, action.id, action.title);
            return { byId: { ...state.byId, [action.id]: w } };
        }
        case "PIN": {
            const w = ensure(state, action.id);
            return { byId: { ...state.byId, [action.id]: { ...w, pinned: true } } };
        }
        case "MINIMIZE": {
            const w = ensure(state, action.id);

            // --- posizionamento in ALTO a SINISTRA, sotto la navbar ---
            // prendo la --nav-height (fallback 56px)
            const navVar = getComputedStyle(document.documentElement).getPropertyValue("--nav-height");
            const navH = parseInt(navVar, 10) || 56;

            // quante icone già minimizzate
            const count = Object.values(state.byId).filter(v => v.minimized && !v.closed).length;

            // griglia verso destra, poi va a capo
            const COL_W = 50;      // passo orizzontale
            const ROW_H = 54;      // passo verticale
            const MARGIN_X = 12;
            const TOP_OFFSET = navH + 8; // subito sotto la navbar

            const iconPos = w.iconPos || {
                x: MARGIN_X + (count % 8) * COL_W,
                y: TOP_OFFSET + Math.floor(count / 8) * ROW_H,
            };

            return {
                byId: {
                    ...state.byId,
                    [action.id]: { ...w, minimized: true, closed: false, iconPos },
                },
            };
        }
        case "RESTORE": {
            const w = ensure(state, action.id);
            return { byId: { ...state.byId, [action.id]: { ...w, minimized: false, closed: false } } };
        }
        case "CLOSE": {
            const w = ensure(state, action.id);
            return { byId: { ...state.byId, [action.id]: { ...w, minimized: false, closed: true } } };
        }
        case "SET_ICON_POS": {
            const w = ensure(state, action.id);
            return { byId: { ...state.byId, [action.id]: { ...w, iconPos: { x: action.x, y: action.y } } } };
        }
        default:
            return state;
    }
}

const Ctx = createContext(null);

export function WindowProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const register   = useCallback((id, title) => dispatch({ type: "REGISTER", id, title }), []);
    const pin        = useCallback((id) => dispatch({ type: "PIN", id }), []);
    const minimize   = useCallback((id) => dispatch({ type: "MINIMIZE", id }), []);
    const restore    = useCallback((id) => dispatch({ type: "RESTORE", id }), []);
    const close      = useCallback((id) => dispatch({ type: "CLOSE", id }), []);
    const setIconPos = useCallback((id, x, y) => dispatch({ type: "SET_ICON_POS", id, x, y }), []);

    const value = useMemo(() => ({ state, register, pin, minimize, restore, close, setIconPos }), [
        state, register, pin, minimize, restore, close, setIconPos,
    ]);

    return (
        <Ctx.Provider value={value}>
            {/* scope con le vars/z-index per tutte le finestre */}
            <div className={styles.varsScope}>{children}</div>
        </Ctx.Provider>
    );
}

export function useWindows() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useWindows deve essere usato dentro <WindowProvider>.");
    return ctx;
}
