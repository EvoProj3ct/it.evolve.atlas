"use client";
import { useWindows } from "./WindowManager";
import styles from "./WindowsStyles.module.css";

/** IconTray: mostra un bottone per ogni finestra minimizzata. */
export default function WindowTray() {
  const { state, restore } = useWindows();
  const minimized = Object.values(state.byId).filter(w => w.minimized && !w.closed);

  if (minimized.length === 0) return null;

  const onRestore = (id) => {
    restore(id);
    const el = document.querySelector(`[data-window-id="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
      <div className={styles.tray} aria-label="Finestre minimizzate">
        {minimized.map((w) => (
            <button
                key={w.id}
                type="button"
                className={styles.icon}
                title={w.title}
                aria-label={`Riapri ${w.title}`}
                onClick={() => onRestore(w.id)}
            >
              {w.title?.slice(0, 1) || "?"}
            </button>
        ))}
      </div>
  );
}
