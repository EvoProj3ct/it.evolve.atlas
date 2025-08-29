"use client";

import { useEffect } from "react";

/**
 * mode: "ALIEN" (invader a sagoma continua) | "GHOST" (fantasma Pac-Man)
 * Richiede nel DOM i layer vuoti:
 *  - .space-ship-container
 *  - .bullet-layer
 *  - .aliens-layer
 */
export default function ParallaxAliens({ mode = "ALIEN" }) {
  useEffect(() => {
    const shipContainer = document.querySelector(".space-ship-container");
    const bulletLayer   = document.querySelector(".bullet-layer");
    const alienLayer    = document.querySelector(".aliens-layer");
    if (!shipContainer || !bulletLayer || !alienLayer) return;

    // ── Config ────────────────────────────────────────────────────────────────
    const ALIEN_COLORS = ["#39FF14", "#00FFFF", "#F7FF00", "#FF00FF", "#FF66CC"];
    const GHOST_COLORS = ["#FF0000", "#FFB8DE", "#00FFFF", "#FFA500", "#7F00FF"];

    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // dimensioni/velocità
    const SIZE          = 90;                    // lato nemico (px)
    const BULLET_W      = 4;
    const BULLET_H      = 20;
    const BULLET_SPEED  = prefersReduce ? 120 : 150; // px/s
    const ALIEN_SPEED   = prefersReduce ? 70  : 92;  // px/s
    const BULLET_EVERY  = prefersReduce ? 1.2 : 1; // sec
    const ALIEN_EVERY   = prefersReduce ? 1.8 : 1.15; // sec

    const FOOTER_SELECTOR       = ".footer"; // cambia se serve
    const SHIP_MIN_BOTTOM       = 4;              // px dal bordo viewport
    const SHIP_GAP_FROM_FOOTER  = 1;              // 1px sopra il footer

    // ── Costruttori a sagoma piena (clip-path) ───────────────────────────────
    const createShip = () => {
      // Rocket/arrow “spacey”
      const el = document.createElement("div");
      el.className = "ship-shape";
      const W = 54, H = 58;
      el.style.position   = "absolute";
      el.style.left       = "0px";
      el.style.bottom     = `${SHIP_MIN_BOTTOM}px`; // verrà “clampata” vs footer
      el.style.width      = `${W}px`;
      el.style.height     = `${H}px`;
      el.style.background = "var(--foreground)";
      el.style.filter     = "drop-shadow(0 0 10px var(--foreground))"; // glow SOLO nave
      el.style.clipPath =
          "polygon(50% 0%, 60% 10%, 60% 35%, 80% 48%, 60% 48%, 60% 70%, 70% 80%, 50% 100%, 30% 80%, 40% 70%, 40% 48%, 20% 48%, 40% 35%, 40% 10%)";
      // oblò (foro)
      const windowCircle = document.createElement("span");
      Object.assign(windowCircle.style, {
        position: "absolute",
        left: "50%",
        top: "28%",
        transform: "translate(-50%,-50%)",
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        background: "var(--background)",
      });
      el.appendChild(windowCircle);
      return el;
    };

    const createGhost = (color) => {
      const el = document.createElement("div");
      el.className = "alien ghost";
      el.style.width = `${SIZE}px`;
      el.style.height = `${SIZE}px`;
      el.style.background = color;
      el.style.borderRadius = "50% 50% 14% 14%";
      el.style.clipPath =
          "polygon(0 0,100% 0,100% 80%,86% 90%,72% 80%,58% 90%,44% 80%,30% 90%,16% 80%,0 90%)";
      const eye = () => {
        const e = document.createElement("span");
        e.className = "eye";
        const p = document.createElement("span");
        p.className = "pupil";
        e.appendChild(p);
        return e;
      };
      const e1 = eye(), e2 = eye();
      e1.style.left = "32%"; e2.style.left = "58%";
      el.appendChild(e1); el.appendChild(e2);
      return el;
    };

    const createAlien = (color) => {
      // Invader a sagoma continua (più “space invaders” di prima)
      const el = document.createElement("div");
      el.className = "alien invader";
      el.style.width = `${SIZE}px`;
      el.style.height = `${SIZE}px`;
      el.style.background = color;
      // Sagoma: testa + braccia + gambe (rettangolare e “spigolosa”)
      el.style.clipPath =
          "polygon(12% 18%, 88% 18%, 88% 34%, 78% 34%, 78% 44%, 88% 44%, 88% 58%, 76% 58%, 76% 70%, 62% 70%, 62% 58%, 38% 58%, 38% 70%, 24% 70%, 24% 58%, 12% 58%, 12% 44%, 22% 44%, 22% 34%, 12% 34%)";
      // Occhi “fori” quadrati
      el.style.position = "relative";
      const eye = (x) => {
        const e = document.createElement("span");
        Object.assign(e.style, {
          position: "absolute",
          top: "36%",
          left: x,
          width: "12%",
          height: "10%",
          background: "var(--background)",
        });
        return e;
      };
      el.appendChild(eye("32%"));
      el.appendChild(eye("56%"));
      return el;
    };

    const spawnExplosion = (cx, cy, color) => {
      const ex = document.createElement("span");
      ex.className = "explosion";
      ex.style.left = `${cx - 12}px`;
      ex.style.top  = `${cy - 12}px`;
      ex.style.color = color;
      ex.style.background = `radial-gradient(circle, ${color} 0%, ${color} 40%, transparent 70%)`;
      alienLayer.appendChild(ex);
      setTimeout(() => ex.remove(), 600);
    };

    // ── Stato runtime (UNICO sistema: viewport top/left) ─────────────────────
    // bullets: { el, x, yTop, w, h }
    // aliens:  { el, x, yTop, w, h, color }
    const bullets = [];
    const aliens  = [];

    // Crea nave una volta
    const ship = createShip();
    shipContainer.appendChild(ship);

    // Posizione nave (x = left px; y = bottom px gestito via style.bottom)
    let shipX = 0;

    // Helper: ricava “top” della punta nave in viewport
    const shipTipTop = () => {
      const bottom = parseFloat(ship.style.bottom || `${SHIP_MIN_BOTTOM}`); // px dal fondo viewport
      const topFromViewport = window.innerHeight - (bottom + ship.clientHeight);
      return topFromViewport; // px dal top viewport
    };

    // Clamp contro footer: nave sempre ≥ 1px sopra
    const clampShipBottomAgainstFooter = () => {
      const footer = document.querySelector(FOOTER_SELECTOR);
      if (!footer) { ship.style.bottom = `${SHIP_MIN_BOTTOM}px`; return; }

      const rectTop = footer.getBoundingClientRect().top; // px dal top viewport
      // quanto “bottom” serve per stare 1px sopra il bordo superiore del footer
      const neededBottom =
          Math.max(
              SHIP_MIN_BOTTOM,
              window.innerHeight - (rectTop - SHIP_GAP_FROM_FOOTER) - ship.clientHeight
          );

      ship.style.bottom = `${neededBottom}px`;
    };

    // Movimento nave (orizzontale col puntatore) + clamp footer
    const onPointerMove = (e) => {
      shipX = e.clientX - ship.clientWidth / 2;
      if (shipX < 0) shipX = 0;
      const maxX = window.innerWidth - ship.clientWidth;
      if (shipX > maxX) shipX = maxX;
      ship.style.left = `${shipX}px`;

      clampShipBottomAgainstFooter();
    };
    const onResizeOrScroll = () => clampShipBottomAgainstFooter();

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResizeOrScroll, { passive: true });
    window.addEventListener("scroll", onResizeOrScroll, { passive: true });

    // ── Spawner (coordinati al sistema "top") ────────────────────────────────
    const spawnBullet = () => {
      const el = document.createElement("span");
      el.className = "bullet";
      // posizionamento iniziale: X = centro nave; Y = poco sopra la punta
      const x = shipX + ship.clientWidth / 2 - BULLET_W / 2;
      let yTop = shipTipTop() - BULLET_H * 0.4; // 40% sopra la punta

      // style: usiamo TOP, non bottom
      el.style.left = `${x}px`;
      el.style.top  = `${yTop}px`;
      el.style.position = "absolute";

      bulletLayer.appendChild(el);
      bullets.push({ el, x, yTop, w: BULLET_W, h: BULLET_H });
    };

    const spawnAlien = () => {
      const palette = mode === "GHOST" ? GHOST_COLORS : ALIEN_COLORS;
      const color   = palette[(Math.random() * palette.length) | 0];

      const el = mode === "GHOST" ? createGhost(color) : createAlien(color);
      const x  = Math.random() * (window.innerWidth - SIZE);
      const yTop = -SIZE; // SEMPRE da sopra, come richiesto

      el.style.left = `${x}px`;
      el.style.top  = `${yTop}px`;
      el.style.position = "absolute";

      alienLayer.appendChild(el);
      aliens.push({ el, x, yTop, w: SIZE, h: SIZE, color });
    };

    // ── Loop ──────────────────────────────────────────────────────────────────
    let rafId = 0, last = performance.now();
    let tBullet = 0, tAlien = 0;

    const update = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      tBullet += dt; tAlien += dt;
      if (tBullet >= BULLET_EVERY) { spawnBullet(); tBullet = 0; }
      if (tAlien  >= ALIEN_EVERY)  { spawnAlien();  tAlien  = 0; }

      // BULLETS: verso l'alto → yTop diminuisce
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.yTop -= BULLET_SPEED * dt;
        if (b.yTop + b.h < 0) { // completamente fuori sopra
          b.el.remove(); bullets.splice(i, 1); continue;
        }
        b.el.style.top = `${b.yTop}px`;
      }

      // ALIENS: verso il basso → yTop aumenta
      for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        a.yTop += ALIEN_SPEED * dt;
        if (a.yTop > window.innerHeight) { // completamente fuori sotto
          a.el.remove(); aliens.splice(i, 1); continue;
        }
        a.el.style.top = `${a.yTop}px`;
      }

      // COLLISIONI AABB nello stesso sistema (viewport top/left)
      for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];
        const bL = b.x,         bR = b.x + b.w;
        const bT = b.yTop,      bB = b.yTop + b.h;

        for (let ai = aliens.length - 1; ai >= 0; ai--) {
          const a = aliens[ai];
          const aL = a.x,       aR = a.x + a.w;
          const aT = a.yTop,    aB = a.yTop + a.h;

          if (bL < aR && bR > aL && bT < aB && bB > aT) {
            // esplosione al centro alieno
            spawnExplosion(a.x + a.w / 2, a.yTop + a.h / 2, a.color);
            a.el.remove(); aliens.splice(ai, 1);
            b.el.remove(); bullets.splice(bi, 1);
            break;
          }
        }
      }

      rafId = requestAnimationFrame(update);
    };

    // Primo clamp e avvio
    clampShipBottomAgainstFooter();
    rafId = requestAnimationFrame(update);

    // cleanup
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll);
      cancelAnimationFrame(rafId);
      bullets.forEach(b => b.el.remove());
      aliens.forEach(a => a.el.remove());
      ship.remove();
    };
  }, [mode]);

  return null;
}
