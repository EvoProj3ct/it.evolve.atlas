"use client";

import React, { useEffect } from "react";

/**
 * Logica del gioco:
 * - navicella segue il puntatore (pointermove).
 * - spara proiettili a intervalli.
 * - alieni scendono: posizioni gestite in JS e applicate con transform (niente layout thrashing).
 * - collisioni AABB su numeri in memoria.
 * - cleanup completo (RAF + eventi).
 *
 * NOTA: perché gli alieni si vedano, applica il patch CSS sui z-index (vedi inizio risposta).
 */
export default function ParallaxAliens() {
  useEffect(() => {
    const ship = document.querySelector(".bottom-ship");
    const bulletLayer = document.querySelector(".bullet-layer");
    const alienLayer = document.querySelector(".aliens-layer");
    if (!ship || !bulletLayer || !alienLayer) return;

    // Se vuoi usare immagini /alien1.svg..3.svg metti true; altrimenti emoji 👾 (sempre visibile)
    const USE_IMAGES = false;

    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const bullets = []; // { el, x, y, w, h }
    const aliens  = []; // { el, x, y, w, h }

    let shipX = 0;

    const onPointerMove = (e) => {
      shipX = e.clientX - ship.clientWidth / 2;
      ship.style.left = `${shipX}px`; // coerente col tuo CSS (ship usa left/bottom)
      // NB: se preferisci transform, puoi usare: ship.style.transform = `translate3d(${shipX}px,0,0)`
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const spawnBullet = () => {
      const el = document.createElement("span");
      el.className = "bullet";
      const x = shipX + ship.clientWidth / 2 - 2;
      const y = 0; // parte dal basso
      el.style.left = `${x}px`;
      el.style.bottom = `${y}px`;
      bulletLayer.appendChild(el);
      bullets.push({ el, x, y, w: 4, h: 20 }); // h=20 come nel tuo CSS
    };

    const spawnAlien = () => {
      let el;
      if (USE_IMAGES) {
        el = document.createElement("img");
        const idx = (Math.random() * 3 | 0) + 1;
        el.src = `/alien${idx}.svg`;
        el.alt = "Alien";
      } else {
        el = document.createElement("div");
        el.textContent = "👾";
        el.style.fontSize = "40px";
        el.style.display = "grid";
        el.style.placeItems = "center";
      }
      el.className = "alien";
      const x = Math.random() * (window.innerWidth - 80);
      const y = -80; // top iniziale (coerente col tuo CSS .alien { top: -80px })
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      alienLayer.appendChild(el);
      aliens.push({ el, x, y, w: 80, h: 80 });
    };

    let rafId = 0;
    let last = performance.now();
    let bulletTimer = 0;
    let alienTimer = 0;

    const BULLET_INTERVAL = prefersReduce ? 0.6 : 0.3; // sec
    const ALIEN_INTERVAL  = prefersReduce ? 1.8 : 1.0;
    const BULLET_SPEED = prefersReduce ? 300 : 500;    // px/s
    const ALIEN_SPEED  = prefersReduce ? 80  : 120;

    const update = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      bulletTimer += dt;
      alienTimer += dt;
      if (bulletTimer >= BULLET_INTERVAL) { spawnBullet(); bulletTimer = 0; }
      if (alienTimer >= ALIEN_INTERVAL)  { spawnAlien();  alienTimer  = 0; }

      // Proiettili: si muovono verso l'alto (incremento bottom)
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.y += BULLET_SPEED * dt;
        if (b.y > window.innerHeight) {
          b.el.remove(); bullets.splice(i, 1); continue;
        }
        b.el.style.bottom = `${b.y}px`;
      }

      // Alieni: scendono (incremento top)
      for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i];
        a.y += ALIEN_SPEED * dt;
        if (a.y > window.innerHeight) {
          a.el.remove(); aliens.splice(i, 1); continue;
        }
        a.el.style.top = `${a.y}px`;
      }

      // Collisioni AABB calcolate sui numeri (nessun getBoundingClientRect)
      for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];
        const bL = b.x, bR = b.x + b.w, bT = window.innerHeight - (b.y + b.h), bB = window.innerHeight - b.y;
        // Nota: bullet usa bottom -> per collisione calcolo top/bottom in coordinate pagina
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
      bullets.forEach(b => b.el.remove());
      aliens.forEach(a => a.el.remove());
    };
  }, []);

  return null;
}
