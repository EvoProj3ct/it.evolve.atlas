"use client";

import React, { useEffect } from "react";

/**
 * Mini-gioco:
 * - La navicella segue il puntatore (pointermove).
 * - Proiettili generati a intervallo, alieni che scendono.
 * - Collisioni AABB calcolate su posizioni in memoria (niente layout).
 * - Trasformazioni con transform: translate3d (GPU friendly).
 * - Cleanup completo di RAF/eventi al dismount.
 * - Rispetta prefers-reduced-motion (meno elementi/velocità).
 */
export default function ParallaxAliens() {
  useEffect(() => {
    const ship = document.querySelector(".bottom-ship");
    const bulletLayer = document.querySelector(".bullet-layer");
    const alienLayer = document.querySelector(".aliens-layer");
    if (!ship || !bulletLayer || !alienLayer) return;

    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const bullets = []; // { el, x, y, w, h }
    const aliens  = []; // { el, x, y, w, h }

    let shipX = 0;

    const onPointerMove = (e) => {
      shipX = e.clientX - ship.clientWidth / 2;
      ship.style.transform = `translate3d(${shipX}px,0,0)`;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const spawnBullet = () => {
      const el = document.createElement("span");
      el.className = "bullet";
      const x = shipX + ship.clientWidth / 2 - 2;
      const y = 0; // parte dal basso
      el.style.transform = `translate3d(${x}px,${-y}px,0)`;
      bulletLayer.appendChild(el);
      bullets.push({ el, x, y, w: 4, h: 12 });
    };

    const spawnAlien = () => {
      const el = document.createElement("img");
      const idx = (Math.random() * 3 | 0) + 1;
      el.src = `/alien${idx}.svg`;
      el.className = "alien";
      const x = Math.random() * (window.innerWidth - 80);
      const y = -80;
      el.style.transform = `translate3d(${x}px,${y}px,0)`;
      alienLayer.appendChild(el);
      aliens.push({ el, x, y, w: 80, h: 80 });
    };

    let rafId = 0;
    let last = performance.now();
    let bulletTimer = 0;
    let alienTimer = 0;

    const BULLET_INTERVAL = prefersReduce ? 0.6 : 0.3; // sec
    const ALIEN_INTERVAL  = prefersReduce ? 1.8 : 1.0;
    const BULLET_SPEED = prefersReduce ? 300 : 500;    // px/sec
    const ALIEN_SPEED  = prefersReduce ? 80  : 120;

    const update = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      // Spawn temporizzati
      bulletTimer += dt;
      alienTimer += dt;
      if (bulletTimer >= BULLET_INTERVAL) { spawnBullet(); bulletTimer = 0; }
      if (alienTimer >= ALIEN_INTERVAL)  { spawnAlien();  alienTimer  = 0; }

      // Aggiorna proiettili (iterazione inversa per rimozioni sicure)
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y += BULLET_SPEED * dt;
        if (b.y > window.innerHeight + 20) {
          b.el.remove();
          bullets.splice(i, 1);
          continue;
        }
        b.el.style.transform = `translate3d(${b.x}px,${-b.y}px,0)`;
      }

      // Aggiorna alieni
      for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        a.y += ALIEN_SPEED * dt;
        if (a.y > window.innerHeight + 100) {
          a.el.remove();
          aliens.splice(i, 1);
          continue;
        }
        a.el.style.transform = `translate3d(${a.x}px,${a.y}px,0)`;
      }

      // Collisioni AABB su posizioni in memoria (senza getBoundingClientRect)
      for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];
        const bL = b.x, bR = b.x + b.w, bT = -b.y, bB = -b.y + b.h;
        for (let ai = aliens.length - 1; ai >= 0; ai--) {
          const a = aliens[ai];
          const aL = a.x, aR = a.x + a.w, aT = a.y, aB = a.y + a.h;
          if (bL < aR && bR > aL && bT < aB && bB > aT) {
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
  }, []);

  return null;
}
