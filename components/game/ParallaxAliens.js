"use client";

import { useEffect } from "react";

/**
 * mode: "ALIEN" (invader a sagoma) | "GHOST" (fantasma)
 * Richiede nel DOM (in HomeParallax) i layer vuoti:
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

    const SIZE          = 90;                    // lato nemico (px) — leggermente ridotto
    const BULLET_W      = 4;
    const BULLET_H      = 20;
    const BULLET_SPEED  = prefersReduce ? 90 : 210; // px/s
    const ALIEN_SPEED   = prefersReduce ? 70  : 92;  // px/s (più lenti)
    const BULLET_EVERY  = prefersReduce ? 1.2 : 0.35; // sec
    const ALIEN_EVERY   = prefersReduce ? 1.8 : 1.15; // sec

    const FOOTER_SELECTOR = ".footer";      // <— cambia se la tua classe è diversa
    const SHIP_MIN_BOTTOM = 4;                   // bottom di base (px)
    const SHIP_GAP_FROM_FOOTER = 1;              // 1px sopra il bordo superiore del footer

    // ── Sagome (clip-path) ───────────────────────────────────────────────────

    // Nave a sagoma (rocket stilizzato). SOLO lei ha glow.
    const createShip = () => {
      const el = document.createElement("div");
      el.className = "ship-shape";
      const W = 54, H = 58;
      el.style.position   = "absolute";
      el.style.left       = "0px";
      el.style.bottom     = `${SHIP_MIN_BOTTOM}px`;
      el.style.width      = `${W}px`;
      el.style.height     = `${H}px`;
      el.style.background = "var(--foreground)"; // pieno
      el.style.filter     = "drop-shadow(0 0 10px var(--foreground))";
      // corpo/alette
      el.style.clipPath =
          "polygon(50% 0%, 60% 10%, 60% 35%, 80% 48%, 60% 48%, 60% 70%, 70% 80%, 50% 100%, 30% 80%, 40% 70%, 40% 48%, 20% 48%, 40% 35%, 40% 10%)";
      // oblò (foro sul colore di sfondo della pagina)
      const windowCircle = document.createElement("span");
      windowCircle.style.position = "absolute";
      windowCircle.style.left = "50%";
      windowCircle.style.top  = "28%";
      windowCircle.style.transform = "translate(-50%,-50%)";
      windowCircle.style.width  = "12px";
      windowCircle.style.height = "12px";
      windowCircle.style.borderRadius = "50%";
      windowCircle.style.background = "var(--background)";
      el.appendChild(windowCircle);
      return el;
    };

    // Fantasma (sagoma piena) — come nel tuo esempio
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

    // Alieno invader stilizzato a sagoma continua (no pixel)
    const createAlien = (color) => {
      const el = document.createElement("div");
      el.className = "alien invader";
      el.style.width = `${SIZE}px`;
      el.style.height = `${SIZE}px`;
      el.style.background = color;
      // testa/spalle/braccia/gambe sagomate
      el.style.clipPath =
          "polygon(10% 15%, 90% 15%, 90% 35%, 80% 35%, 80% 45%, 90% 45%, 90% 60%, 80% 60%, 80% 70%, 65% 70%, 65% 60%, 35% 60%, 35% 70%, 20% 70%, 20% 60%, 10% 60%, 10% 45%, 20% 45%, 20% 35%, 10% 35%)";
      // "occhi" scavati
      const eye = (x) => {
        const e = document.createElement("span");
        e.style.position = "absolute";
        e.style.top = "34%";
        e.style.left = x;
        e.style.width = "14%";
        e.style.height = "8%";
        e.style.background = "var(--background)";
        return e;
      };
      const e1 = eye("30%"), e2 = eye("56%");
      el.style.position = "relative";
      el.appendChild(e1); el.appendChild(e2);
      return el;
    };

    // esplosione ad anelli
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

    // ── Stato runtime ─────────────────────────────────────────────────────────
    const bullets = []; // { el, x, y, w, h }
    const aliens  = []; // { el, x, y, w, h, color }
    let shipX = 0;

    // Crea nave una volta
    const ship = createShip();
    shipContainer.appendChild(ship);

    // Limita la nave a stare 1px sopra il footer
    const clampShipBottomAgainstFooter = () => {
      const footer = document.querySelector(FOOTER_SELECTOR);
      if (!footer) return;
      const footerTopViewport = footer.getBoundingClientRect().top; // px dalla cima viewport
      // se il footer non è visibile sopra (top > vh), nessun vincolo addizionale
      // calcola il bottom minimo per tenere la nave 1px sopra il bordo superiore del footer
      const requiredBottom =
          Math.max(
              SHIP_MIN_BOTTOM,
              window.innerHeight - (footerTopViewport - SHIP_GAP_FROM_FOOTER) - ship.clientHeight
          );
      const currentBottom = parseFloat(ship.style.bottom || `${SHIP_MIN_BOTTOM}`);
      if (requiredBottom > currentBottom) {
        ship.style.bottom = `${requiredBottom}px`;
      } else if (footerTopViewport > window.innerHeight) {
        // footer fuori schermo sotto: torna al bottom minimo
        ship.style.bottom = `${SHIP_MIN_BOTTOM}px`;
      }
    };

    // movimento nave (orizzontale col puntatore) + vincolo footer
    const onPointerMove = (e) => {
      shipX = e.clientX - ship.clientWidth / 2;
      if (shipX < 0) shipX = 0;
      const maxX = window.innerWidth - ship.clientWidth;
      if (shipX > maxX) shipX = maxX;
      ship.style.left = `${shipX}px`;

      clampShipBottomAgainstFooter();
    };

    // ricalcola vincolo su resize/scroll (footer si muove in viewport)
    const onResizeOrScroll = () => {
      clampShipBottomAgainstFooter();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResizeOrScroll, { passive: true });
    window.addEventListener("scroll", onResizeOrScroll, { passive: true });

    // bullet
    const spawnBullet = () => {
      const el = document.createElement("span");
      el.className = "bullet";
      const x = shipX + ship.clientWidth / 2 - BULLET_W / 2;
      const y = 0;
      el.style.left   = `${x}px`;
      el.style.bottom = `${y}px`;
      bulletLayer.appendChild(el);
      bullets.push({ el, x, y, w: BULLET_W, h: BULLET_H });
    };

    // alien
    const spawnAlien = () => {
      const palette = mode === "GHOST" ? GHOST_COLORS : ALIEN_COLORS;
      const color   = palette[(Math.random() * palette.length) | 0];

      const el = mode === "GHOST" ? createGhost(color) : createAlien(color);
      const x  = Math.random() * (window.innerWidth - SIZE);
      const y  = -SIZE;

      el.style.left = `${x}px`;
      el.style.top  = `${y}px`;
      alienLayer.appendChild(el);
      aliens.push({ el, x, y, w: SIZE, h: SIZE, color });
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

      // bullets ↑
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y += BULLET_SPEED * dt;
        if (b.y > window.innerHeight) { b.el.remove(); bullets.splice(i, 1); continue; }
        b.el.style.bottom = `${b.y}px`;
      }

      // aliens ↓
      for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        a.y += ALIEN_SPEED * dt;
        if (a.y > window.innerHeight) { a.el.remove(); aliens.splice(i, 1); continue; }
        a.el.style.top = `${a.y}px`;
      }

      // collisioni AABB
      for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];
        const bL = b.x, bR = b.x + b.w;
        const bT = window.innerHeight - (b.y + b.h);
        const bB = window.innerHeight - b.y;
        for (let ai = aliens.length - 1; ai >= 0; ai--) {
          const a = aliens[ai];
          const aL = a.x, aR = a.x + a.w, aT = a.y, aB = a.y + a.h;
          if (bL < aR && bR > aL && bT < aB && bB > aT) {
            spawnExplosion(a.x + a.w / 2, a.y + a.h / 2, a.color);
            a.el.remove(); aliens.splice(ai, 1);
            b.el.remove(); bullets.splice(bi, 1);
            break;
          }
        }
      }

      rafId = requestAnimationFrame(update);
    };

    // primo clamp (in caso di footer già in viewport) e avvio loop
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
