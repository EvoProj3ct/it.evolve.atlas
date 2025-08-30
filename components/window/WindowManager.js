"use client";

import React, { createContext, useContext, useReducer, useMemo, useCallback } from "react";

/**
 * Stato per ogni finestra:
 *  - pinned:   dopo primo hover/focus la barra resta visibile e la card resta "zoomata"
 *  - minimized: nascosta e presente nella tray
 *  - closed:    nascosta, NON presente nella tray
 */
const initialState = { byId: {} };

function ensure(state, id, title) {
    const existing = state.byId[id];
    if (existing) {
        // se arriva un nuovo title, aggiorno
        if (title && title !== existing.title) {
            return { ...existing, title };
        }
        return existing;
    }
    return { id, title: title || id, pinned: false, minimized: false, closed: false };
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
            return { byId: { ...state.byId, [action.id]: { ...w, minimized: true, closed: false } } };
        }
        case "RESTORE": {
            const w = ensure(state, action.id);
            return { byId: { ...state.byId, [action.id]: { ...w, minimized: false, closed: false } } };
        }
        case "CLOSE": {
            const w = ensure(state, action.id);
            return { byId: { ...state.byId, [action.id]: { ...w, minimized: false, closed: true } } };
        }
        default:
            return state;
    }
}

const Ctx = createContext(null);

export function WindowProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const register = useCallback((id, title) => dispatch({ type: "REGISTER", id, title }), []);
    const pin      = useCallback((id) => dispatch({ type: "PIN", id }), []);
    const minimize = useCallback((id) => dispatch({ type: "MINIMIZE", id }), []);
    const restore  = useCallback((id) => dispatch({ type: "RESTORE", id }), []);
    const close    = useCallback((id) => dispatch({ type: "CLOSE", id }), []);

    const value = useMemo(() => ({ state, register, pin, minimize, restore, close }), [
        state, register, pin, minimize, restore, close,
    ]);

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWindows() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useWindows deve essere usato dentro <WindowProvider>.");
    return ctx;
}
