"use client";
import { useEffect } from "react";
import styles from "./GameStyles.module.css";

/** colori fluo */
const COLORS = ["#39FF14", "#00FFFF", "#FF00FF", "#FFD700", "#00FF7F"];
const SIZE = 96;           // CSS usa --alien-size: manteniamoli allineati
const BULLET_SPEED = 6;
const ALIEN_SPEED = 1.6;

export default function ParallaxAliens({ mode = "ALIEN" }) {
  useEffect(() => {
    const shipLayer   = document.querySelector('[data-game="ship-layer"]');
    const bulletLayer = document.querySelector('[data-game="bullets"]');
    const alienLayer  = document.querySelector('[data-game="aliens"]');
    if (!shipLayer || !bulletLayer || !alienLayer) return;

    // --- nave -------------------------------------------------------------
    const ship = document.createElement("img");
    ship.src = "/ship.svg";
    ship.alt = "";
    ship.className = styles.ship;
    ship.style.left = "0px";
    shipLayer.appendChild(ship);

    const onMouseMove = (e) => {
      const x = e.clientX - ship.clientWidth/2;
      ship.style.left = `${Math.max(0, Math.min(window.innerWidth - ship.clientWidth, x))}px`;
    };
    window.addEventListener("mousemove", onMouseMove);

    // --- spawn proiettili -------------------------------------------------
    const bullets = [];
    const spawnBullet = () => {
      const b = document.createElement("span");
      b.className = styles.bullet;
      // posizioniamo a y=0 nello strato bullets (poi lo animiamo con top)
      b.style.left = `${ship.offsetLeft + ship.clientWidth/2 - 2}px`;
      b.style.top  = `${bulletLayer.clientHeight - shipLayer.clientHeight - 20}px`;
      bulletLayer.appendChild(b);
      bullets.push(b);
    };
    const bulletInt = setInterval(spawnBullet, 320);

    // --- nemici -----------------------------------------------------------
    const aliens = [];
    const makeGhost = (color) => {
      const el = document.createElement("div");
      el.className = `${styles.alien} ghost`;
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
    const makeInvader = (color) => {
      const el = document.createElement("div");
      el.className = `${styles.alien} sprite`;
      el.style.setProperty("--alien-color", color);
      return el;
    };

    const spawnAlien = () => {
      const color = COLORS[Math.floor(Math.random()*COLORS.length)];
      const el = mode === "GHOST" ? makeGhost(color) : makeInvader(color);
      el.style.left = `${Math.random() * (window.innerWidth - SIZE)}px`;
      el.style.top  = `-${SIZE}px`;
      alienLayer.appendChild(el);
      aliens.push(el);
    };
    const alienInt = setInterval(spawnAlien, 1100);

    // --- animazione -------------------------------------------------------
    let raf;
    const loop = () => {
      const H = bulletLayer.clientHeight;
      // bullets
      for (let i=bullets.length-1;i>=0;i--){
        const b = bullets[i];
        b.style.top = `${parseFloat(b.style.top) - BULLET_SPEED}px`;
        if (parseFloat(b.style.top) < -20){
          b.remove(); bullets.splice(i,1);
        }
      }
      // aliens
      for (let i=aliens.length-1;i>=0;i--){
        const a = aliens[i];
        a.style.top = `${parseFloat(a.style.top) + ALIEN_SPEED}px`;
        if (parseFloat(a.style.top) > H){
          a.remove(); aliens.splice(i,1);
        }
      }
      // collisioni
      bullets.forEach((b, bi) => {
        const br = b.getBoundingClientRect();
        aliens.forEach((a, ai) => {
          const ar = a.getBoundingClientRect();
          if (br.left < ar.right && br.right > ar.left && br.top < ar.bottom && br.bottom > ar.top){
            spawnExplosion((br.left+br.right)/2, (br.top+br.bottom)/2, a);
            a.remove(); aliens.splice(ai,1);
            b.remove(); bullets.splice(bi,1);
          }
        });
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // esplosione
    const spawnExplosion = (cx, cy, alienEl) => {
      const ex = document.createElement("span");
      ex.className = styles.explosion;
      ex.style.left = `${cx - 12}px`;
      ex.style.top  = `${cy - 12}px`;
      ex.style.color = getComputedStyle(alienEl).getPropertyValue("--alien-color") || "#39FF14";
      alienLayer.appendChild(ex);
      setTimeout(() => ex.remove(), 900);
    };

    // cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      clearInterval(bulletInt); clearInterval(alienInt);
      cancelAnimationFrame(raf);
      bullets.forEach(b => b.remove());
      aliens.forEach(a => a.remove());
      ship.remove();
    };
  }, [mode]);

  return null;
}
