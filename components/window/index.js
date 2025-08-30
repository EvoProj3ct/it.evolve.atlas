// Import/Export “unificato” per usare un solo import nel resto dell’app

export { WindowProvider, useWindows } from "./WindowManager";
export { default as WindowTray } from "./WindowTray";
export { default } from "./WindowFrame"; // default export = WindowFrame
