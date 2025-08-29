"use client";
import React, { useEffect } from "react";

/**
 * mode: "ALIEN" (pixel-art 👾 con colori fluo) | "GHOST" (👻 stile Pac-Man)
 */
export default function ParallaxAliens({ mode = "ALIEN" }) {
  useEffect(() => {
    const ship = document.querySelector(".ship-emoji");          // <-- emoji nave
    const bulletLayer = document.querySelector(".bullet-layer");
    const alienLayer = document.querySelector(".aliens-layer");
    if (!ship || !bulletLayer || !alienLayer) return;

    const ALIEN_COLORS = ["#39FF14", "#00FFFF", "#F7FF00", "#FF00FF", "#FF66CC"];
    const GHOST_COLORS = ["#FF0000", "#FFB8DE", "#00FFFF", "#FFA500", "#7F00FF"];

    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const bullets = []; // { el, x, y, w, h }
    const aliens  = []; // { el, x, y, w, h, color }

    const SIZE = 96;                               // più piccoli di prima
    const BULLET_H = 20, BULLET_W = 4;
    const BULLET_INTERVAL = prefersReduce ? 0.6 : 0.35;
    const ALIEN_INTERVAL  = prefersReduce ? 1.8 : 1.2;
    const BULLET_SPEED    = prefersReduce ? 300 : 520;   // px/s
    const ALIEN_SPEED     = prefersReduce ? 70  : 95;    // un po' più lenti

    let shipX = 0;

    const onPointerMove = (e) => {
      shipX = e.clientX - 23; // centratura rispetto a font-size 46px circa
      ship.style.left = `${shipX}px`;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const spawnBullet = () => {
      const el = document.createElement("span");
      el.className = "bullet";
      const x = shipX + 23 - BULLET_W / 2;
      const y = 0;
      el.style.left = `${x}px`;
      el.style.bottom = `${y}px`;
      bulletLayer.appendChild(el);
      bullets.push({ el, x, y, w: BULLET_W, h: BULLET_H });
    };

    const createGhost = (color) => {
      const el = document.createElement("div");
      el.className = "alien ghost";
      el.style.width = `${SIZE}px`;
      el.style.height = `${SIZE}px`;
      el.style.background = color;
      el.style.borderRadius = "50% 50% 14% 14%";
      el.style.clipPath = "polygon(0 0,100% 0,100% 80%,86% 90%,72% 80%,58% 90%,44% 80%,30% 90%,16% 80%,0 90%)";
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

    const createAlienSprite = (color) => {
      const el = document.createElement("div");
      el.className = "alien sprite";
      el.style.setProperty("--alien-size", `${SIZE}px`);
      el.style.setProperty("--alien-color", color);
      el.style.width = `${SIZE}px`;
      el.style.height = `${SIZE}px`;
      return el;
    };

    const spawnAlien = () => {
      const palette = mode === "GHOST" ? GHOST_COLORS : ALIEN_COLORS;
      const color = palette[(Math.random() * palette.length) | 0];

      const el = mode === "GHOST" ? createGhost(color) : createAlienSprite(color);
      const x = Math.random() * (window.innerWidth - SIZE);
      const y = -SIZE;

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      alienLayer.appendChild(el);
      aliens.push({ el, x, y, w: SIZE, h: SIZE, color });
    };

    const spawnExplosion = (cx, cy, color) => {
      const ex = document.createElement("span");
      ex.className = "explosion";
      ex.style.left = `${cx - 12}px`;
      ex.style.top = `${cy - 12}px`;
      ex.style.color = color; // per i ring ::before/::after
      ex.style.background = `radial-gradient(circle, ${color} 0%, ${color} 40%, transparent 70%)`;
      alienLayer.appendChild(ex);
      setTimeout(() => ex.remove(), 600);
    };

    let rafId = 0, last = performance.now();
    let bulletTimer = 0, alienTimer = 0;

    const update = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      bulletTimer += dt;
      alienTimer += dt;
      if (bulletTimer >= BULLET_INTERVAL) { spawnBullet(); bulletTimer = 0; }
      if (alienTimer  >= ALIEN_INTERVAL)  { spawnAlien();  alienTimer  = 0; }

      // BULLETS
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y += BULLET_SPEED * dt;
        if (b.y > window.innerHeight) {
          b.el.remove(); bullets.splice(i, 1); continue;
        }
        b.el.style.bottom = `${b.y}px`;
      }

      // ALIENS
      for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        a.y += ALIEN_SPEED * dt;
        if (a.y > window.innerHeight) {
          a.el.remove(); aliens.splice(i, 1); continue;
        }
        a.el.style.top = `${a.y}px`;
      }

      // COLLISIONI
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

    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(rafId);
      bullets.forEach((b) => b.el.remove());
      aliens.forEach((a) => a.el.remove());
    };
  }, [mode]);

  return null;
}
