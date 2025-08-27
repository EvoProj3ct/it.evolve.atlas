"use client";
import { useEffect } from "react";

export default function ParallaxAliens() {
  useEffect(() => {
    const ship = document.querySelector(".bottom-ship");
    const bulletLayer = document.querySelector(".bullet-layer");
    const alienLayer = document.querySelector(".aliens-layer");
    const colors = ["pink", "red", "blue", "green", "yellow"];
    const bullets = [];
    const aliens = [];

    const handleMouseMove = (e) => {
      if (ship) {
        ship.style.left = `${e.clientX - ship.clientWidth / 2}px`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const spawnBullet = () => {
      if (!ship || !bulletLayer) return;
      const bullet = document.createElement("span");
      bullet.className = "bullet";
      bullet.style.left = `${ship.offsetLeft + ship.clientWidth / 2 - 2}px`;
      bullet.style.bottom = `0px`;
      bulletLayer.appendChild(bullet);
      bullets.push(bullet);
    };

    const spawnAlien = () => {
      if (!alienLayer) return;
      const alien = document.createElement("img");
      const idx = Math.floor(Math.random() * 3) + 1;
      alien.src = `/alien${idx}.svg`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      alien.className = `alien ${color}`;
      alien.style.left = `${Math.random() * (window.innerWidth - 80)}px`;
      alien.style.top = `-80px`;
      alienLayer.appendChild(alien);
      aliens.push(alien);
    };

    const update = () => {
      bullets.forEach((b, i) => {
        b.style.bottom = `${parseFloat(b.style.bottom) + 5}px`;
        if (parseFloat(b.style.bottom) > window.innerHeight) {
          b.remove();
          bullets.splice(i, 1);
        }
      });

      aliens.forEach((a, i) => {
        a.style.top = `${parseFloat(a.style.top) + 2}px`;
        if (parseFloat(a.style.top) > window.innerHeight) {
          a.remove();
          aliens.splice(i, 1);
        }
      });

      bullets.forEach((b, bi) => {
        const bRect = b.getBoundingClientRect();
        aliens.forEach((a, ai) => {
          const aRect = a.getBoundingClientRect();
          if (
            bRect.left < aRect.right &&
            bRect.right > aRect.left &&
            bRect.top < aRect.bottom &&
            bRect.bottom > aRect.top
          ) {
            a.remove();
            aliens.splice(ai, 1);
            b.remove();
            bullets.splice(bi, 1);
          }
        });
      });

      requestAnimationFrame(update);
    };

    update();

    const bulletInterval = setInterval(spawnBullet, 300);
    const alienInterval = setInterval(spawnAlien, 1000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(bulletInterval);
      clearInterval(alienInterval);
    };
  }, []);

  return null;
}
