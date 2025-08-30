"use client";

import { useEffect } from "react";

/**
 * mode: "ALIEN" (invader) | "GHOST" (fantasma)
 * Layer richiesti nel DOM:
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

    // ─────────────────────────────────────────────────────────────────────────
    // Config
    const ALIEN_COLORS = ["#39FF14", "#00FFFF", "#F7FF00", "#FF00FF", "#FF66CC", "#FF0000", "#7F00FF"];
    const GHOST_COLORS = ["#FF0000", "#FFB8DE", "#00FFFF", "#FFA500", "#7F00FF"];

    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const SIZE          = 90;                    // lato nemico
    const BULLET_W      = 4;
    const BULLET_H      = 20;
    const BULLET_SPEED  = prefersReduce ? 300 : 520; // px/s
    const ALIEN_SPEED   = prefersReduce ? 60  : 82;  // px/s
    const BULLET_EVERY  = prefersReduce ? 0.6 : 0.35; // s
    const ALIEN_EVERY   = prefersReduce ? 0.6 : 0.35; // s

    const FOOTER_SELECTOR       = ".site-footer";
    const SHIP_MIN_BOTTOM       = 4;
    const SHIP_GAP_FROM_FOOTER  = 1;

    // ─────────────────────────────────────────────────────────────────────────
    // Nave: SOLO la punta (triangolo) tipo navigatore, nessuno stelo/coda
    const createShip = () => {
      const svgNS = "http://www.w3.org/2000/svg";
      const ship = document.createElementNS(svgNS, "svg");
      ship.classList.add("ship-shape");
      ship.setAttribute("width", "64");
      ship.setAttribute("height", "72");
      ship.style.position = "absolute";
      ship.style.left = "0px";
      ship.style.bottom = `${SHIP_MIN_BOTTOM}px`;
      ship.style.filter = "drop-shadow(0 0 10px var(--foreground))";

      // punta (triangolo allungato)
      const tip = document.createElementNS(svgNS, "polygon");
      tip.setAttribute("points", "32,0 54,46 32,38 10,46");
      tip.style.fill = "var(--foreground)";

      ship.appendChild(tip);
      return ship;
    };

    // 👻 Fantasma
    const createGhost = (color) => {
      const el = document.createElement("div");
      el.className = "alien ghost";
      el.style.position = "absolute";
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

    // 👾 Invader (blocchi)
    const createAlien = (color) => {
      const el = document.createElement("div");
      el.className = "alien invader";
      el.style.position = "absolute";
      el.style.width = `${SIZE}px`;
      el.style.height = `${SIZE}px`;
      el.style.background = "transparent";

      const add = (left, top, w, h) => {
        const b = document.createElement("div");
        Object.assign(b.style, {
          position: "absolute",
          left: left + "px",
          top: top + "px",
          width: w + "px",
          height: h + "px",
          background: color,
        });
        el.appendChild(b);
        return b;
      };

      const u = SIZE / 10;

      add(1.5*u, 3.2*u, 7*u, 3.2*u);
      add(0.5*u, 4.0*u, 1*u, 1.2*u);
      add(8.5*u, 4.0*u, 1*u, 1.2*u);
      add(2.0*u, 2.0*u, 0.9*u, 0.9*u);
      add(7.1*u, 2.0*u, 0.9*u, 0.9*u);

      const eye = (x) => {
        const e = document.createElement("div");
        Object.assign(e.style, {
          position: "absolute",
          left: x + "px",
          top: (4.1*u) + "px",
          width: (1.2*u) + "px",
          height: (1.2*u) + "px",
          background: "var(--background)",
        });
        el.appendChild(e);
      };
      eye(3.0*u); eye(5.8*u);

      add(1.2*u, 6.4*u, 7.6*u, 0.9*u);
      add(2.0*u, 7.6*u, 1.6*u, 0.9*u);
      add(6.4*u, 7.6*u, 1.6*u, 0.9*u);

      return el;
    };

    const spawnExplosion = (cx, cy, color) => {
      const ex = document.createElement("span");
      ex.className = "explosion";
      // centro più grande per densità
      ex.style.left = `${cx - 22}px`;
      ex.style.top  = `${cy - 22}px`;
      ex.style.width = "44px";
      ex.style.height = "44px";
      ex.style.color = color; // usata come currentColor

      // struttura interna: core + halo + 6 sparks
      const core = document.createElement("span");
      core.className = "ex-core";
      const halo = document.createElement("span");
      halo.className = "ex-halo";

      ex.appendChild(core);
      ex.appendChild(halo);

      // 6 schegge in direzioni fisse (distribuzione esagonale)
      const angles = [0, 60, 120, 180, 240, 300];
      const radius = 40; // px (prima del fattore animazione)
      angles.forEach((deg) => {
        const s = document.createElement("span");
        s.className = "ex-spark";
        const rad = (deg * Math.PI) / 180;
        const dx = Math.cos(rad) * radius;
        const dy = Math.sin(rad) * radius;
        s.style.setProperty("--dx", dx + "px");
        s.style.setProperty("--dy", dy + "px");
        ex.appendChild(s);
      });

      // bagliore fondo “pieno”: aggiungo un gradient di base molto denso
      ex.style.background = `radial-gradient(circle,
    #fff 0%,
    #fff 12%,
    ${color} 28%,
    ${color} 62%,
    rgba(0,0,0,0) 85%
  )`;

      // glow spesso (tre corone, tutte sul colore pieno)
      ex.style.boxShadow = `
    0 0 26px 10px ${color},
    0 0 44px 18px ${color},
    0 0 58px 28px #ffffffaa
  `;

      ex.style.opacity = "0.98";

      alienLayer.appendChild(ex);
      setTimeout(() => ex.remove(), 1000);
    };



    // Runtime state
    const bullets = []; // { el, x, yTop, w, h }
    const aliens  = []; // { el, x, yTop, w, h, color }

    const ship = createShip();
    shipContainer.appendChild(ship);

    let shipX = 0;

    const shipTipTop = () => {
      const bottom = parseFloat(ship.style.bottom || `${SHIP_MIN_BOTTOM}`);
      return window.innerHeight - (bottom + ship.clientHeight);
    };

    const clampShipBottomAgainstFooter = () => {
      const footer = document.querySelector(FOOTER_SELECTOR);
      if (!footer) { ship.style.bottom = `${SHIP_MIN_BOTTOM}px`; return; }
      const rectTop = footer.getBoundingClientRect().top;
      const need =
          Math.max(
              SHIP_MIN_BOTTOM,
              window.innerHeight - (rectTop - SHIP_GAP_FROM_FOOTER) - ship.clientHeight
          );
      ship.style.bottom = `${need}px`;
    };

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

    // Spawner
    const spawnBullet = () => {
      const el = document.createElement("span");
      el.className = "bullet";
      const x = shipX + ship.clientWidth / 2 - BULLET_W / 2;
      let yTop = shipTipTop() - BULLET_H * 0.4;
      Object.assign(el.style, { position: "absolute", left: `${x}px`, top: `${yTop}px` });
      bulletLayer.appendChild(el);
      bullets.push({ el, x, yTop, w: BULLET_W, h: BULLET_H });
    };

    const spawnAlien = () => {
      const palette = mode === "GHOST" ? GHOST_COLORS : ALIEN_COLORS;
      const color   = palette[(Math.random() * palette.length) | 0];
      const el      = mode === "GHOST" ? createGhost(color) : createAlien(color);
      const x       = Math.random() * (window.innerWidth - SIZE);
      const yTop    = -SIZE;

      Object.assign(el.style, { left: `${x}px`, top: `${yTop}px` });
      alienLayer.appendChild(el);
      aliens.push({ el, x, yTop, w: SIZE, h: SIZE, color });
    };

    // Loop
    let rafId = 0, last = performance.now();
    let tB = 0, tA = 0;

    const update = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      tB += dt; tA += dt;
      if (tB >= BULLET_EVERY) { spawnBullet(); tB = 0; }
      if (tA >= ALIEN_EVERY)  { spawnAlien();  tA = 0; }

      // bullets ↑
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.yTop -= BULLET_SPEED * dt;
        if (b.yTop + b.h < 0) { b.el.remove(); bullets.splice(i, 1); continue; }
        b.el.style.top = `${b.yTop}px`;
      }

      // aliens ↓
      for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        a.yTop += ALIEN_SPEED * dt;
        if (a.yTop > window.innerHeight) { a.el.remove(); aliens.splice(i, 1); continue; }
        a.el.style.top = `${a.yTop}px`;
      }

      // collisioni AABB
      for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];
        const bL = b.x,         bR = b.x + b.w;
        const bT = b.yTop,      bB = b.yTop + b.h;
        for (let ai = aliens.length - 1; ai >= 0; ai--) {
          const a = aliens[ai];
          const aL = a.x,       aR = a.x + a.w;
          const aT = a.yTop,    aB = a.yTop + a.h;
          if (bL < aR && bR > aL && bT < aB && bB > aT) {
            spawnExplosion(a.x + a.w / 2, a.yTop + a.h / 2, a.color);
            a.el.remove(); aliens.splice(ai, 1);
            b.el.remove(); bullets.splice(bi, 1);
            break;
          }
        }
      }

      rafId = requestAnimationFrame(update);
    };

    clampShipBottomAgainstFooter();
    rafId = requestAnimationFrame(update);

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
