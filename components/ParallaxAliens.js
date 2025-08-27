"use client";
import { useEffect } from "react";

export default function ParallaxAliens() {
  useEffect(() => {
    const handleScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      const progress = window.scrollY / total;

      const ship = document.querySelector('.bottom-ship');
      if (ship) {
        const maxX = window.innerWidth - ship.clientWidth;
        ship.style.transform = `translateX(${progress * maxX}px)`;
      }

      const bullets = document.querySelectorAll('.bullet');
      bullets.forEach((bullet, i) => {
        bullet.style.transform = `translateY(${-(window.scrollY * 0.5 + i * 80)}px)`;
      });

      const aliens = document.querySelectorAll('.alien');
      aliens.forEach((alien, i) => {
        const y = window.scrollY * (0.3 + i * 0.1);
        const x = Math.sin(window.scrollY / 80 + i) * 50;
        alien.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}
