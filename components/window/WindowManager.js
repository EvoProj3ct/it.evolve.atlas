"use client";

import React, { createContext, useContext, useMemo, useReducer, useCallback } from "react";

/**
 * Stato centralizzato di tutte le finestre.
 * Ogni finestra (id) ha: title, visible (in pagina), minimized (in tray).
 */
const initialState = { windows: {} };

function reducer(state, action) {
    switch (action.type) {
        case "REGISTER": {
            const prev = state.windows[action.id];
            const next = prev
                ? { ...prev, title: action.title }
                : { id: action.id, title: action.title, visible: true, minimized: false };
            return { windows: { ...state.windows, [action.id]: next } };
        }
        case "UNREGISTER": {
            const { [action.id]: _unused, ...rest } = state.windows;
            return { windows: rest };
        }
        case "MINIMIZE": {
            const w = state.windows[action.id];
            if (!w) return state;
            return { windows: { ...state.windows, [action.id]: { ...w, visible: false, minimized: true } } };
        }
        case "REOPEN": {
            const w = state.windows[action.id];
            if (!w) return state;
            return { windows: { ...state.windows, [action.id]: { ...w, visible: true, minimized: false } } };
        }
        case "CLOSE": {
            const w = state.windows[action.id];
            if (!w) return state;
            return { windows: { ...state.windows, [action.id]: { ...w, visible: false, minimized: false } } };
        }
        default:
            return state;
    }
}

const WindowManagerContext = createContext(null);

/**
 * Provider: avvolgi la pagina con questo per usare lo stato delle finestre.
 */
export function WindowProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Azioni (memoizzate) per registrare/deregistrare e cambiare stato delle finestre
    const register = useCallback((id, title) => dispatch({ type: "REGISTER", id, title }), []);
    const unregister = useCallback((id) => dispatch({ type: "UNREGISTER", id }), []);
    const minimize = useCallback((id) => dispatch({ type: "MINIMIZE", id }), []);
    const reopen   = useCallback((id) => dispatch({ type: "REOPEN", id }), []);
    const close    = useCallback((id) => dispatch({ type: "CLOSE", id }), []);

    const value = useMemo(() => ({ state, register, unregister, minimize, reopen, close }), [
        state, register, unregister, minimize, reopen, close,
    ]);

    return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>;
}

/**
 * Hook per usare il manager: fornisce stato + azioni.
 */
export function useWindowManager() {
    const ctx = useContext(WindowManagerContext);
    if (!ctx) throw new Error("useWindowManager deve essere usato dentro <WindowProvider>.");
    return ctx;
}
